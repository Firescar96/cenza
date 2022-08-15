import OvenMediaRTCClient from './OvenMediaRTCClient';
import './WebRTCClient';
import './WebsocketClient';
import { generateName } from '@/utility';
import liveInterfaces from '@/components/live/liveInterfaces';

class MessagingManager {
  initialize(roomName) {
    this.roomName = roomName;
    if(!this.myName) {
      this.myName = generateName();
    }
    this.isActiveTyping = false;
    liveInterfaces.ovenMediaClient.initialize(roomName);
    liveInterfaces.websocketClient.initialize(roomName);
  }

  get myName() {
    return localStorage.getItem('myName');
  }

  set myName(value) {
    localStorage.setItem('myName', value);
  }
}

liveInterfaces.messagingManager = new MessagingManager();
