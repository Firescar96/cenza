import Component from 'vue-class-component';
import { shallowRef } from '@vue/composition-api';

const { SimplePeer } = window;

@Component({
  props: {
    videoController: Object,
    websocketConnection: Object,
  },
  setup() {
    return {
      audioInputs: shallowRef([]),
      audioOutputs: shallowRef([]),
      streamToName: shallowRef({}),
      _audioInputEnabled: shallowRef(true),
    };
  },
})
class WebRTCClient {
  created() {
    this.selectedStream = null;

    this.setupWebRTCConnection();
    this.getDevices();
  }

  async createLoopbackStream(stream) {
    this.rtcConnection = null;
    this.rtcLoopbackConnection = null;
    const loopbackStream = new MediaStream(); //this is the stream you will read from for actual audio output

    const offerOptions = {
      offerVideo: true,
      offerAudio: true,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    };

    //initialize the RTC connections

    this.rtcConnection = new RTCPeerConnection();
    this.rtcLoopbackConnection = new RTCPeerConnection();

    this.rtcConnection.onicecandidate = (e) => e.candidate && this.rtcLoopbackConnection.addIceCandidate(new RTCIceCandidate(e.candidate));
    this.rtcLoopbackConnection.onicecandidate = (e) => e.candidate && this.rtcConnection.addIceCandidate(new RTCIceCandidate(e.candidate));

    this.rtcLoopbackConnection.ontrack = (e) => e.streams[0].getTracks().forEach((track) => loopbackStream.addTrack(track));

    //setup the loopback
    this.rtcConnection.addStream(stream); //this stream would be the processed stream coming out of Web Audio API destination node

    const offer = await this.rtcConnection.createOffer(offerOptions);
    await this.rtcConnection.setLocalDescription(offer);

    await this.rtcLoopbackConnection.setRemoteDescription(offer);
    const answer = await this.rtcLoopbackConnection.createAnswer();
    await this.rtcLoopbackConnection.setLocalDescription(answer);

    await this.rtcConnection.setRemoteDescription(answer);

    return loopbackStream;
  }

  setupWebRTCConnection() {
    this.connection = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    //it's important this stream handler is placed early on, before the signal handler so we don't miss any messages from peers
    this.connection.on('stream', async (stream) => {
      const audioContext = new AudioContext();
      const destinationNode = audioContext.createMediaStreamDestination();
      const audioGainNode = audioContext.createGain();

      const audioSource = audioContext.createMediaStreamSource(stream);
      audioSource.connect(audioGainNode);
      audioGainNode.connect(audioContext.destination);
      audioGainNode.gain.value = 1.5;

      //experimental trying to fix loopback
      const loopbackStream = await this.createLoopbackStream(stream);

      //without this reference the stream doesnt get activated or something and the audio wont come through
      //https://stackoverflow.com/questions/63296568/webaudio-connecting-stream-to-destination-doesnt-work
      //https://bugs.chromium.org/p/chromium/issues/detail?id=933677&q=webrtc%20silent&can=2

      new Audio().srcObject = loopbackStream;
      this.videoController.$set(this.videoController.peerStreams, this.videoController.peerStreams.length, {
        stream, //original stream is used to track with peer is connected and eventually can be used for video
        volume: 1.5,
        audioGainNode,
      });
    });

    this.connection.on('error', () => this.setupWebRTCConnection());

    this.connection.on('signal', (signal) => {
      const rawdata = JSON.stringify({
        flag: 'webrtcSignal',
        signal,
      });
      this.websocketConnection.send(rawdata);
    });
  }

  get audioInputEnabled() {
    return this._audioInputEnabled;
  }

  set audioInputEnabled(mutedState) {
    if(!this.selectedStream) return;
    this.selectedStream.getAudioTracks().forEach((track) => {
      track.enabled = mutedState;
    });
    this._audioInputEnabled = mutedState;
  }

  async getDevices() {
    const deviceInfos = await navigator.mediaDevices.enumerateDevices();
    //Handles being called several times to update labels. Preserve values.
    this.audioInputs = [];
    this.audioOutputs = [];

    for(let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = {
        value: deviceInfo.deviceId,
      };
      if(deviceInfo.kind === 'audioinput') {
        option.label = deviceInfo.label || `microphone ${this.audioInputs.length + 1}`;
        this.audioInputs.push(option);
      } else if(deviceInfo.kind === 'audiooutput') {
        option.label = deviceInfo.label || `speaker ${this.audioOutputs.length + 1}`;
        this.audioOutputs.push(option);
      }
    }
  }

  //Attach audio output device to video element using device/sink ID.
  changeAudioSink(audioDestination) {
    if(!this.videoController.$refs.peerVideo) return;
    this.videoController.$refs.peerVideo.forEach((videoElement) => {
      if(typeof videoElement.sinkId !== 'undefined') {
        videoElement.setSinkId(audioDestination);
      } else {
        console.warn('Browser does not support output device selection.');
      }
    });
  }

  async gotStream(stream) {
    if(this.selectedStream) this.connection.removeStream(this.selectedStream);

    this.selectedStream = stream;
    this.connection.addStream(stream);
  }

  async changeAudioSource(audioSource) {
    const constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    await this.gotStream(stream);
    await this.getDevices();
  }
}

export default WebRTCClient;
