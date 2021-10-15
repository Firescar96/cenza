<template>
  <div id="viewer-guide">
    <div>You should have received a Stream Key from the event host. Put in that key below to generate the url and join your friends.</div>
    <input v-model="streamKey" type="text" placeholder="type here"> <a :href="urlLocation + '/live/' + streamKey">{{ urlLocation + "/live/" + streamKey }}</a>
  </div>
</template>
<script>
import Component from 'vue-class-component';

export default
@Component
class ViewerGuide {
  data() {
    return {
      streamKey: '',
      urlLocation: window.location.origin,
    };
  }
}
</script>
<style lang="scss">
  #viewer-guide {
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
