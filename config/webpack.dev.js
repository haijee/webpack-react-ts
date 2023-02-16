const path = require("path");
const { merge } = require("webpack-merge");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const webpackCommonConfig = require("./webpack.common");

const devWebpackConfig = merge(webpackCommonConfig, {
  mode: "development",
  devtool: "source-map",
  entry: {
    main: "./src/index",
  },

  devServer: {
    open: true, // 自动打开浏览器,不指定浏览器就打开默认浏览器
    host: "localhost",
    hot: true, // 开发模块热替换可以可以
    compress: true, // 是否启用 gzip 压缩
    historyApiFallback: true, // 解决前端路由刷新404现象
    client: {
      logging: "info",
      overlay: false, // 关闭报错时覆盖整个屏幕
    },
  },
  plugins: [
    // 热更新
    new ReactRefreshWebpackPlugin(),
  ],
});

module.exports = devWebpackConfig;
