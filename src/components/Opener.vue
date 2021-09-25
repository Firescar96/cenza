<template>
  <div id="opener">
    <div id="livestreamBox">
      <div>Active Livestreams</div>
      <a class="livestream-link" href="/live/lobby">
        <img src="/live/homestuck_splatter_gamzee_makara_logo_by_kunfuzi-d776nvu.png">
        <div>
          <span>Relax</span>
          <span>Be Me</span>
        </div>
      </a>
    </div>
  </div>
</template>

<style lang="scss">
  #opener {
    background: black;
  }

  #livestreamBox {
    display: inline-block;
    font-family: IndieFlower;
    color: white;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 40px;

    a {
      display: block;
      text-align: center;
      position: relative;

      img {
        height: 200px;
        width: auto;
      }

      div {
        text-decoration: none !important;
        color: Black;
        position: absolute;
        font-size: 40px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;

        span {
          display: block;
        }
      }

      &:hover {
        div {
          opacity: 1;
          color: white;
        }
        img {
          opacity: .4;
        }
      }
    }
  }
</style>
