const path = require("path");
const { merge } = require("webpack-merge");
const copyWebpackPlugin = require("copy-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const { gzip } = require("zlib");

const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

const webpackCommonConfig = require("./webpack.common");

const PUBLIC_PATH = path.resolve(__dirname, "../public");
const SRC_PATH = path.resolve(__dirname, "../src");

const prodWebpackConfig = merge(webpackCommonConfig, {
  mode: "production",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css",
      chunkFilename: "static/css/[name].[contenthash].css",
      ignoreOrder: true,
    }),
    new copyWebpackPlugin({
      patterns: [
        {
          from: PUBLIC_PATH,
          to: "./",
          // 选择要忽略的文件
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ["**/index.html*"],
          },
        },
      ],
    }),
    // 生成目录文件
    new WebpackManifestPlugin({
      fileName: "asset-manifest.json",
      generate: (seed, files, entryPoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          if (manifest) manifest[file.name] = file.path;
          return manifest;
        }, seed);
        const entrypointFiles = entryPoints.index?.filter(
          (fileName) => !fileName.endsWith(".map")
        );

        return {
          files: manifestFiles,
          entryPoints: entrypointFiles,
        };
      },
    }),
    // 打包体积分析
    new BundleAnalyzerPlugin(),
    // 压缩文件
    new CompressionWebpackPlugin({
      filename: "[path][base].gz",
      algorithm: "gzip",
      test: /\.js$|\.json$|\.css/,
      threshold: 10240, // 只有大小大于该值的资源会被处理
      minRatio: 0.8, // 只有压缩率小于这个值的资源才会被处理
      algorithm: gzip,
    }),
  ],
  // 优化代码
  optimization: {
    chunkIds: "named",
    moduleIds: "deterministic", //单独模块id，模块内容变化再更新
    minimize: true,
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        test: /\.(tsx?|jsx?)$/,
        include: [SRC_PATH],
        exclude: /node_module/,
        parallel: true,
        terserOptions: {
          toplevel: true, // 最高级别，删除无用代码
          ie8: true,
          safari10: true,
          compress: {
            arguments: false,
            dead_code: true,
            pure_funcs: ["console.log"], // 删除console.log
          },
        },
      }),
      // 优化和缩小 html 和 css
      new CssMinimizerPlugin(),
      new HtmlMinimizerPlugin(),
    ],
    // 分包
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          name: "vendors",
          enforce: true, // ignore splitChunks.minSize, splitChunks.minChunks, splitChunks.maxAsyncRequests and splitChunks.maxInitialRequests
          test: /[\\/]node_modules[\\/]/,
          filename: "static/js/[id]_vendors.js",
          priority: 10,
        },
        react: {
          test(module) {
            return (
              module.resource && module.resource.includes("node_modules/react")
            );
          },
          chunks: "initial",
          filename: "react.[contenthash].js",
          priority: 1,
          maxInitialRequests: 2,
          minChunks: 1,
        },
      },
    },
    runtimeChunk: {
      name: "runtime",
    },
  },
  // 使用CDN，可直接引用在index.html
  externals: {
    react: "react",
    redux: "redux",
    "react-dom": "ReactDOM",
    "react-router-dom": "ReactRouterDOM",
    axios: "axios",
  },

});

module.exports = prodWebpackConfig;
