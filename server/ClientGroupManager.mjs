import childProcess from 'child_process';
import path from 'path';
import fs from 'fs';
import forever from 'forever-monitor';
import { WSClient } from './WSClient.mjs';

class ClientGroupManager {
  constructor(name) {
    this.name = name;
    this.clients = {};
    this.isLiveVideo = true;
    this.clientsWaitingToSync = []; //clients who have requested a timecheck
    this.numResponsesRequested = 0; //number of clients we need to respond to get an estimate of the time to sync to

    this.initializeLiveTranscoder();
  }

  initializeLiveTranscoder(name) {
    const hlsManifestPath = `/mnt/aux1/hls/${this.name}.m3u8`;
    if(process.env.NODE_ENV == 'production' && !fs.existsSync(hlsManifestPath)) {
      const source = path.resolve(process.cwd(), 'server/base.m3u8');
      fs.copyFileSync(source, hlsManifestPath);
    }
  }

  addClient(ws) {
    //ws shouldn't be in the global scope of arguments, but must be scoped to this function
    const clientObject = new WSClient(ws);
    this.clients[ws.id] = clientObject;

    ws.on('disconnect', () => {
      Object.values(this.clients).forEach((client) => {
        const message = { flag: 'peerDisconnect', name: this.clients[ws.id].name, lastFrameTime: client.lastFrameTime };
        client.websocket.send(JSON.stringify(message));
      });
      delete this.clients[ws.id];
    });

    ws.on('message', (rawdata) => {
      const data = JSON.parse(rawdata);
      if(!this.clients[ws.id]) return;
      switch(data.flag) {
        case 'webrtcSignal':
          try {
            this.clients[ws.id].webrtcConnection.signal(data.signal);
          } catch (error) {
            //if the user refreshes in the middle of signaling don't crash the whole server
            //we stop webrtc signaling, and the connection will be gracefully cleaned up when the websocket connection detects the peer connection is closed
            if(error.code == 'ERR_DESTROYED') break;
            throw error;
          }
          break;
        case 'videoControl.syncResponse': {
          this.clients[ws.id].lastFrameTime = data.lastFrameTime;
          this.clients[ws.id].isPaused = data.isPaused;
          this.clients[ws.id].ackedSyncRequest = true;
          if('isLiveVideo' in data) this.isLiveVideo = data.isLiveVideo;

          const numSyncResponses = Object.values(this.clients).reduce((a, b) => (b.ackedSyncRequest ? a + 1 : a), 0);

          if(numSyncResponses < this.numResponsesRequested) break;

          let maximumTime = Number.MIN_SAFE_INTEGER;
          let isPaused = false;
          Object.values(this.clients).forEach((client) => {
            if(!client.ackedSyncRequest) return;

            maximumTime = Math.max(maximumTime, client.lastFrameTime);
            isPaused = isPaused || client.isPaused;
          });
          if(maximumTime == Number.MIN_SAFE_INTEGER) break;
          this.clientsWaitingToSync.forEach((clientWS) => {
            const responseMessage = {
              flag: 'videoControl.syncResponse',
              lastFrameTime: maximumTime,
              isLiveVideo: this.isLiveVideo,
              isPaused,
            };
            clientWS.send(JSON.stringify(responseMessage));
          });

          this.clientsWaitingToSync = [];
          Object.values(this.clients).forEach((client) => {
            client.ackedSyncRequest = false;
          });

          break;
        }
        case 'videoControl.syncRequest': {
          this.numResponsesRequested = Object
            .keys(this.clients).length - 1;

          const syncedClients = Object.values(this.clients).filter((x) => x.lastFrameTime).length;
          //the first clients (intentionally plural) have no one to sync to so shortcut
          //there will be clients who have connected to the server but have not yet joined the stream
          if(!syncedClients) {
            const responseMessage = {
              flag: 'videoControl.syncResponse',
              isLiveVideo: false,
              isPaused: false,
            };
            ws.send(JSON.stringify(responseMessage));
            return;
          }

          this.numSyncResponses = 0;
          this.clientsWaitingToSync.push(ws);

          //if there are clients waiting then we are already doing a syncrequest
          //but we still have to do another if they want one
          Object.values(this.clients).forEach((client) => {
            if(client.id == ws.id) return;
            client.websocket.send(rawdata);
            client.ackedSyncRequest = false;
          });

          break;
        }
        case 'videoControl.syncToMe': {
          this.broadcastMessage(rawdata, ws);
          break;
        }
        case 'clientStatus': {
          const status = Object.values(this.clients)
            .map((x) => ({
              name: x.name,
              lastFrameTime: x.lastFrameTime,
            }));
          ws.send(JSON.stringify({ flag: 'clientStatus', status }));
          break;
        }
        case 'ping': {
          this.clients[ws.id].update(data);
          const currentlyTyping = [];
          Object.values(this.clients).filter((c) => c.isActiveTyping).map((c) => c.name);
          const streamToName = {};

          Object.values(this.clients).forEach((client) => {
            if(client.isActiveTyping) currentlyTyping.push(client.name);
            Object.keys(client.streams).forEach((streamId) => { streamToName[streamId] = client.name; });
          });
          ws.send(JSON.stringify({ flag: 'pong', currentlyTyping, streamToName }));
          break;
        }
        default:
          //default is to echo the data to everyone
          this.broadcastMessage(rawdata, ws);
      }
    });

    clientObject.webrtcConnection.on('signal', (signal) => {
      const rawdata = JSON.stringify({
        flag: 'webrtcSignal',
        signal,
      });
      ws.send(rawdata);
    });

    clientObject.webrtcConnection.on('stream', (stream) => {
      //delete old streams from the local storage
      clientObject.streams = {};

      //save and broadcast the new stream to everyone
      clientObject.streams[stream.id] = stream;
      Object.values(this.clients).forEach((client) => {
        if(client.id === ws.id) return;

        try {
          client.webrtcConnection.addStream(stream);
        } catch (error) {
          //if the user refreshes in the middle of receiving the new stream
          if(error.code == 'ERR_DESTROYED') return;
          throw error;
        }
      });
    });

    clientObject.webrtcConnection.on('connect', () => {
      Object.values(this.clients).forEach((client) => {
        if(client.id === clientObject.id) return;
        Object.values(client.streams).forEach((stream) => {
          try {
            clientObject.webrtcConnection.addStream(stream);
          } catch (error) {
            //I've seen this error while debugging the cenza ui, which involves vue refreshing parts of the ui after changes
            //it somewhat makes sense, that a refresh on the webrtc code in the frontend could trigger the same stream to connected multiple times
            //it has not yet been seen in production
            if(error.code == 'ERR_SENDER_ALREADY_ADDED') return;
            throw error;
          }
        });
      });
    });

    clientObject.webrtcConnection.on('error', () => {});
    clientObject.webrtcConnection.on('close', () => {
      clientObject.webrtcConnection.destroy();
    });
  }

  broadcastMessage(rawdata, ws) {
    Object.values(this.clients).forEach((client) => {
      if(ws && client.id === ws.id) return;
      client.websocket.send(rawdata);
    });
  }

  destroy() {
    Object.values(this.clients).forEach((client) => {
      client.webrtcConnection.destroy();
    });
  }
}

export { ClientGroupManager };
