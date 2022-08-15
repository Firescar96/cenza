import liveInterfaces from '@/components/live/liveInterfaces';

class OvenMediaRTCClient {
  initialize(roomName) {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:stun.cenza.space:3478',
          username: 'user1',
          credential: 'pass1',
        },
      ],
    }, null);

    //signalWS connects to OvenMediaPlayer to negotiate a WebRTC connection to get stream data
    this.signalWS = new WebSocket(`wss://cenza.space:3334/live/${roomName}`);

    this.signalWS.onmessage = this.gotMessageFromServer.bind(this);

    this.signalWS.onopen = () => {
      this.signalWS.send(JSON.stringify({ command: 'request_offer' }));
    };
  }

  async gotMessageFromServer(message) {
    const messageData = JSON.parse(message.data);
    if(messageData.command !== 'offer') return;

    if(this.peerConnection.iceConnectionState === 'new') {
      this.peerConnection.onicecandidate = this.gotIceCandidate.bind(this);

      liveInterfaces.videoController.livePlayer.srcObject = new MediaStream();
      this.peerConnection.ontrack = (event) => {
        event.track.enabled = false;
        liveInterfaces.videoController.livePlayer.srcObject.addTrack(event.track);
      };

      this.peerConnection.onconnectionstatechange = this.onconnectionstatechange.bind(this);
    }

    this.uuid = messageData.id;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(messageData.sdp));

    messageData.candidates.forEach(async (candidate) => {
      await this.peerConnection.addIceCandidate(candidate);
    });

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.signalWS.send(JSON.stringify({
      command: 'answer',
      id: this.uuid,
      sdp: answer,
    }));
  }

  onconnectionstatechange() {
    setInterval(() => {
      if(this.peerConnection.connectionState === 'disconnected') {
        this.peerConnection.close();
        this.initialize();
      }
    }, 500);
  }

  gotIceCandidate(event) {
    if(event.candidate === null) return;
    this.signalWS.send(JSON.stringify({
      command: 'candidate',
      id: this.uuid,
      candidates: [event.candidate],
    }));
  }
}

liveInterfaces.ovenMediaClient = new OvenMediaRTCClient();
