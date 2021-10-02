<template>
  <div id="opener">
    <header>This is Cenza</header>
    <nav>
      <a href="/streamerGuide">Streamers</a>
      <a href="/viewerGuide">Viewers</a>
      <div>About Cenza</div>
    </nav>
  </div>
</template>

<style lang="scss">
  #opener {
    background: black;
    display: flex;
    flex-direction: column;
    color: white;

    header {
      margin: auto;
      margin-bottom: 20px;
    }

    nav {
      margin: auto;
      margin-top: 20px;
      display: flex;

      div, a {
        margin: auto 20px;
      }
    }
  }
</style>
