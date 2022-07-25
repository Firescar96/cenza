import { Server } from 'socket.io';
import httpServer from './server.mjs';
import { ClientGroupManager } from './ClientGroupManager.mjs';

const liveWS = new Server();

liveWS.attach(httpServer, {
  cors: {
    origin: '*',
  },
});

const streamClients = {};
function onConnection(socket) {
  socket.once('message', (data) => {
    const message = JSON.parse(data);
    socket.roomName = message.roomName;
    streamClients[message.roomName] = streamClients[message.roomName] || new ClientGroupManager(message.roomName);
    streamClients[message.roomName].addClient(socket);
  });

  socket.on('close', () => {
    setTimeout(() => {
      if(!streamClients[socket.roomName]) return;
      //if this is the last client delete all history of this room
      if(Object.keys(streamClients[socket.roomName].clients).length === 1) {
        streamClients[socket.roomName].destroy();
        delete streamClients[socket.roomName];
      }
    },
    10000);
  });
}

liveWS.on('connection', onConnection);
