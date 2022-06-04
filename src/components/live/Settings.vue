<template>
  <div id="settingsSection">
    <div id="nameSelectionBox">
      <p>My Name:</p>
      <input v-model="messaging.myName" type="text">
    </div>

    <div v-if="audioEnabled == 'disabled'" id="disabled-audio">
      <p>Audio chat functionality has been disabled, by you. Don't know why you would do that, but you'll need to explicitly give this site permission to use the microphone in your browser settings. Some browsers, like Chrome, and Firefox will show you an icon in the url bar where you can fix this.</p>
      <p>Then come back here and click the enable button.</p>
    </div>

    <div v-if="audioEnabled == 'enabled'">
      Audio Inputs
      <v-select
        v-model="selectedAudioSource"
        :options="messaging.webrtcClient.audioInputs"
        :reduce="x => x.value"
        append-to-body
        @input="changeAudioSource"
      />
      Audio Outputs
      <v-select
        v-model="selectedAudioSink"
        :options="messaging.webrtcClient.audioOutputs"
        :reduce="x => x.value"
        append-to-body
        @input="changeAudioSink"
      />
    </div>
    <div v-else id="enable-audio" @click="enableAudio">
      Enable Audio
    </div>
  </div>
</template>
<script>
import Component from 'vue-class-component';

export default
@Component({
  props: {
    messaging: {
      type: Object,
      required: true,
    },
  },
})
class Settings {
  data() {
    return {
      selectedAudioSource: null,
      selectedAudioSink: null,
      audioEnabled: localStorage.getItem('audioEnabled'),
    };
  }

  async mounted() {
    if(localStorage.getItem('audioEnabled') == 'enabled') await this.enableAudio();
  }

  changeAudioSource() {
    this.messaging.webrtcClient.changeAudioSource(this.selectedAudioSource);
  }

  changeAudioSink() {
    this.messaging.webrtcClient.changeAudioSink(this.selectedAudioSink);
  }

  async enableAudio() {
    //this call has to happen before any work with streams is done, empirically it seems like the browser rejects attaching any streams
    //unless they are attached after this is called
    //chrome on macos in particular blocks the call forever if this is called after any mediastreams are created
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      //the user denied access for some reason
      localStorage.setItem('audioEnabled', 'disabled');
      this.audioEnabled = 'disabled';
      return;
    }
    this.audioEnabled = 'enabled';
    localStorage.setItem('audioEnabled', 'enabled');

    this.messaging.webrtcClient.setupWebRTCConnection();
    await this.messaging.webrtcClient.getDevices();
    if(this.messaging.webrtcClient.audioInputs.length) {
      this.selectedAudioSource = this.messaging.webrtcClient.audioInputs[0].value;
      this.changeAudioSource();
    }
  }
}
</script>
<style lang="scss">
  #settingsSection {
    display: flex;
    flex: 1;
    flex-direction: column;

    #nameSelectionBox {
      margin-top: 15px;
      margin-bottom: 50px;
      display: flex;
      flex-direction: column;
      padding: 0 10px;

      p {
        margin: 0 2px;
      }

      span {
        width: 20%;
      }

      input {
        flex: 1;
        margin: 10px auto;
      }
    }

    .v-select {
      svg {
        fill: #ddd;
      }
      .vs__dropdown-toggle {
        border-color: #aaa;
      }
      .vs__selected {
        color: #eee;
      }
    }

    #disabled-audio {
      padding: 0 20px;
      margin: auto;
      margin-bottom: 20px;
      text-align: center;
    }

    #enable-audio {
      padding: 10px 20px;
      margin: 0 auto;
      margin-bottom: auto;
      background: #222;
      border-radius: 5px;
      cursor: pointer;
    }
  }
</style>
