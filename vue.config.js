const webpackConfig = require('./.webpack.config');

module.exports = {
  configureWebpack: webpackConfig,
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/vars.scss";
          @import '@/global.scss';
        `,
      },
    },
  },
  devServer: {
    allowedHosts: ['localhost.test', 'localhost'],
  },
};
