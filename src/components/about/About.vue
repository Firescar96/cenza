<template>
  <div id="about">
    <header>What is Cenza?</header>
    <div>
      Cenza is a streaming service for small groups of people, primarily used by Nchinda for watching tv or movies with his friends who don't live nearby. Note: Cenza has zero full time developers.
      <br>
      I don't care about your eyeballs, or time, or clickthrough rates. Use this space to do your thing and then begone. Or if you are so inclined contribute using one of the methods below.
    </div>

    <img id="github-logo" src="./GitHub_Logo_White.png" alt="github logo">
    <div>The best way to contribute to Cenza is by contributing <a href="https://github.com/Firescar96/cenza">code on github</a> through pull requests. Any filed issues will go on my backlog of things to do where it will likely never be seen again. Unless we are friends IRL. The faster way to get a new feature is through contributing your time and experience to make an attempt at implementing a feature as a pull request. I will meet you halfway in developing features.</div>

    <img id="frantech-logo" src="./frantech.png" alt="frantech logo">
    <div>The second best way is to contribute is to pay me. I don't need your money, I make a nice salary at my day job, and I hate ads so I'm not going to put any on here. But they say the best things in life aren't free and of course I'll take your money. I pay $30.00 a month to frantech for server space as after extensive research I couldn't find better prices are more reliable service anywhere else. You can donate <a href="https://paypal.me/nchinda2">with paypal</a> or to my bitcoin address: 1Awe87FSXFdDhXLLvtsUX5SjF6o9sfmsqq.</div>

    <header>Credits</header>
    <ul>
      <li>Grace Amos of Elewa for logo design. Which I paid for because good things in life aren't free, and she gave me a discount on because that's what friends do. You can't hire them because I was the last customer.</li>
      <li><a href="https://www.ovenmediaengine.com/ome">OvenMediaEngine</a> for stitching together complex streaming protocols into an accessible format.</li>
      <li><a href="https://videojs.com">Video.js</a> for being a world class video player</li>
      <li><a href="vuejs.org/">Vue.js</a> for putting React.js and especially Angular.js to shame</li>
      <li><a href="https://ffmpeg.org">FFmpeg</a> for continuing to impress as a swill army knife of video processing</li>
    </ul>
  </div>
</template>

<style lang="scss">
#about {
  background: black;
  color: white;
  padding: 2% 5%;

  header {
    font-size: 25px;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  #github-logo {
    margin-top: 20px;
    width: 200px;
  }

  #frantech-logo {
    margin-top: 20px;
  }
}
</style>
