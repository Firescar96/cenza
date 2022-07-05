import OvenMediaRTCClient from './OvenMediaRTCClient';
import './WebRTCClient';
import './WebsocketClient';
import { generateName } from '@/utility';
import liveInterfaces from '@/components/live/liveInterfaces';

class MessagingManager {
  initialize(lobbyName) {
    this.lobbyName = lobbyName;
    if(!this.myName) {
      this.myName = generateName();
    }
    this.isActiveTyping = false;
    this.ovenMediaClient = new OvenMediaRTCClient(this.videoController);
    liveInterfaces.websocketClient.initialize();
  }

  get myName() {
    return localStorage.getItem('myName');
  }

  set myName(value) {
    localStorage.setItem('myName', value);
  }
}

liveInterfaces.messagingManager = new MessagingManager();
