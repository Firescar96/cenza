<template>
  <div id="app">
    <router-view class="main" />
    <link href="https://vjs.zencdn.net/7.6.6/video-js.css" rel="stylesheet">
  </div>
</template>
<style src='overlayscrollbars/css/OverlayScrollbars.css'></style>
<style src='videojs-seek-buttons/dist/videojs-seek-buttons.css'></style>
<style lang="scss" src='material-icons/iconfont/material-icons.scss'></style>
<style lang="scss" src='vue-select/src/scss/vue-select.scss'></style>
<style src='bootstrap/dist/css/bootstrap.css'></style>
<style src='bootstrap-vue/dist/bootstrap-vue.css'></style>
<style lang="scss">
html, body {
  margin: 0;
}

#app {
  display: flex;
  position: relative; //all children should use this as their top level container
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .main {
    width: 100vw;
    flex: 1;
  }
}
</style>
