import { io } from 'socket.io-client';
import liveInterfaces from '@/components/live/liveInterfaces';
import constants from '@/components/constants';

const { SKIP_BACK_SECONDS } = constants;

class WebsocketClient {
  initialize(roomName) {
    const route = new URL(window.location.href);
    //route.protocol = route.protocol.replace('http', 'ws');
    route.pathname = '';
    if(route.port) route.port = 8080;

    this.connection = io(route.href);
    //join can only be issued once and determines which group of viewers is joined
    this.connection.send(JSON.stringify({ flag: 'join', roomName }));

    this.connection.on('message', this.receiveData.bind(this));

    this.connection.on('connect', () => {
      setInterval(() => {
        this.sendMessage({ flag: 'ping', name: liveInterfaces.messagingManager.myName });
      }, 500);

      this.sendMessage({ flag: 'peerConnect', name: liveInterfaces.messagingManager.myName });
    });

    this.connection.io.on('reconnect', () => {
      liveInterfaces.videoController.displayMessage({
        isMeta: true,
        action: 'connect',
      });
    });

    this.connection.on('disconnect', () => {
      liveInterfaces.videoController.displayMessage({
        isMeta: true,
        action: 'disconnect',
      });
    });

    //save the eventhandlers so they can be en/disabled dynamically
    this.eventHandlers = {
      play: (e) => this.sendMessage({ flag: 'videoControl.play', isPaused: false, action: 'syncAction' }),
      pause: () => this.sendMessage({ flag: 'videoControl.pause', isPaused: true, action: 'syncAction' }),
      seek: () => this.sendMessage({ flag: 'videoControl.seek', replace: true, action: 'syncAction' }),
      seekForward: () => this.sendMessage({ flag: 'videoControl.seekForward', action: 'syncAction' }),
      seekBack: () => this.sendMessage({ flag: 'videoControl.seekBack', action: 'syncAction' }),
      seekToLive: () => this.sendMessage({ flag: 'videoControl.seekToLive', action: 'syncAction' }),
    };
  }

  sendMessage(message) {
    //add required parameters to each message
    if(liveInterfaces.videoController.isLiveVideo) message.lastFrameTime = liveInterfaces.videoController.livePlayer.currentTime;
    else message.lastFrameTime = liveInterfaces.videoController.video.currentTime();
    message.isActiveTyping = liveInterfaces.messagingManager.isActiveTyping;
    message.name = liveInterfaces.messagingManager.myName;

    //send it
    this.connection.send(JSON.stringify(message));

    if(message.action === 'syncAction') {
      message.isMeta = true;
      liveInterfaces.videoController.displayMessage(message);
    }
  }

  receiveData(data) {
    const message = JSON.parse(data);

    if(message.flag == 'pong') {
      liveInterfaces.videoController.currentlyTyping = message.currentlyTyping;
      liveInterfaces.webrtcClient.streamToName = message.streamToName;

      //filter out disconnected streams
      const currentStreams = new Set(Object.keys(message.streamToName));
      liveInterfaces.videoController.peerStreams = liveInterfaces.videoController.peerStreams.filter((x) => currentStreams.has(x.sourceStream.id));
      return;
    }

    if(message.flag == 'webrtcSignal') {
      if(!liveInterfaces.webrtcClient.connection) return;
      liveInterfaces.webrtcClient.connection.signal(message.signal);
      return;
    }

    if(message.flag === 'clientStatus') {
      Object.assign(message, {
        isMeta: true,
        action: 'clientStatus',
        status: message.status,
      });
    }

    if(message.flag === 'peerDisconnect') {
      Object.assign(message, {
        isMeta: true,
        action: 'peerDisconnect',
        time: message.lastFrameTime - SKIP_BACK_SECONDS,
      });
    }

    if(message.flag === 'peerConnect') {
      Object.assign(message, {
        isMeta: true,
        action: 'peerConnect',
      });
    }

    if(/^videoControl/.test(message.flag)) {
      this.handleVideoControl(message);
      return;
    }

    liveInterfaces.videoController.displayMessage(message);
  }

  handleVideoControl(message) {
    message.flag = message.flag.replace('videoControl.', '');

    if(message.flag === 'syncRequest' && liveInterfaces.videoController.streamJoined) {
      const isPaused = liveInterfaces.videoController.isLiveVideo ? liveInterfaces.videoController.livePlayer.paused : liveInterfaces.videoController.video.paused();
      this.sendMessage({
        flag: 'videoControl.syncResponse',
        isPaused,
        isLiveVideo: liveInterfaces.videoController.isLiveVideo,
      });
    }

    if(message.flag == 'syncResponse') {
      if(liveInterfaces.videoController.isLiveVideo !== message.isLiveVideo) {
        if(message.isLiveVideo) liveInterfaces.videoController.switchToLive();
        else liveInterfaces.videoController.switchToUnlive();
      }
    }

    if(message.flag === 'seekToLive') liveInterfaces.videoController.switchToLive();
    if(message.flag === 'seekToUnlive') liveInterfaces.videoController.switchToUnlive();

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'syncResponse', 'syncToMe'].includes(message.flag) && liveInterfaces.videoController.streamJoined) {
      if(!liveInterfaces.videoController.isLiveVideo && message.lastFrameTime) {
        liveInterfaces.videoController.video.currentTime(message.lastFrameTime);
      }

      if(liveInterfaces.videoController.streamJoined && 'isPaused' in message) {
        liveInterfaces.videoController.isPaused = message.isPaused;
        const action = message.isPaused ? 'pause' : 'play';

        if(liveInterfaces.videoController.isLiveVideo) {
          liveInterfaces.videoController.livePlayer[action]();
          liveInterfaces.videoController.isLivePaused = message.isPaused;
        } else liveInterfaces.videoController.video[action]();
      }
    }

    if(['play', 'pause', 'seek', 'seekBack', 'seekForward', 'seekToLive', 'seekToUnlive'].includes(message.flag)) {
      message.isMeta = true;
      message.action = 'syncAction';
    }

    if(['syncResponse', 'syncRequest', 'syncToMe'].includes(message.flag)) {
      return;
    }

    liveInterfaces.videoController.displayMessage(message);
  }
}

liveInterfaces.websocketClient = new WebsocketClient();
