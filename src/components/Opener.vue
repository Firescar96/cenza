<template>
  <div id="opener">
    <CenzaLogo id="logo" />
    <nav>
      <a href="/streamerGuide">Streamers</a>
      <a href="/viewerGuide">Viewers</a>
      <a href="/about">About Cenza</a>
    </nav>
  </div>
</template>
<script>
import Component from 'vue-class-component';
import CenzaLogo from './cenza_logotype.svg';

export default
@Component({
  components: {
    CenzaLogo,
  },
})
class Opener {

}
</script>

<style lang="scss">
  #opener {
    background: black;
    display: flex;
    flex-direction: column;
    color: white;

    #logo {
      margin: auto;
      margin-bottom: 20px;

      g {
        stroke: white;
      }
    }
    nav {
      margin: auto;
      margin-top: 20px;
      display: flex;
      font-size: 20px;

      div, a {
        margin: auto 20px;
      }
    }
  }
</style>
