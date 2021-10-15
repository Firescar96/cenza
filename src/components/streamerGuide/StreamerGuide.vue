<template>
  <div id="streamer-guide">
    <div>Instructions:</div>
    <ul>
      <li>Download Open Broadcaster Studio (OBS).</li>
      <li>Come up with a name for the stream. This is your <code>Stream Key</code>.</li>
      <li>In the stream settings choose 'Custom' so you can put in Cenza's url. Cenza accepts streams on the default port of 1935.</li>
      <li>
        The url is <code>rtmp://cenza.space/live</code>. And put in your <code>Stream Key</code>.
        <br>
        <img src="./obsConfig.png" alt="image of OBS settings with stream key filled out">
      </li>
      <li>Save the settings, configure your audio/video sources, and start streaming. Play around with OBS, you'll figure it out.</li>
      <li>Enter the <code>Stream Key</code> below to generate your stream url to share with viewers.</li>
    </ul>

    <input v-model="streamKey" type="text" placeholder="type here"> <a :href="urlLocation + '/live/' + streamKey">{{ urlLocation + "/live/" + streamKey }}</a>
  </div>
</template>
<script>
import Component from 'vue-class-component';

export default
@Component
class StreamerGuide {
  data() {
    return {
      streamKey: '',
      urlLocation: window.location.origin,
    };
  }
}
</script>
<style lang="scss">
  #streamer-guide {
    background: black;
    color: white;
    padding: 2% 5%;

    input[type=text] {
      background: transparent;
      border: none;
      border-bottom: solid 1px white;
      outline: none;
      padding: 0 5px;
      color: white;
    }
  }
</style>
