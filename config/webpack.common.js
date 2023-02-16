const path = require("path");
const { DefinePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const WebpackBar = require("webpackbar");
// 环境变量
const isDev = process.env.NODE_ENV === "development";

// 公共路径
const SRC_PATH = path.resolve(__dirname, "../src");
const DIST_PATH = path.resolve(__dirname, "../dist");

module.exports = {
  output: {
    path: isDev ? undefined : DIST_PATH,
    // 图片、字体资源
    assetModuleFilename: "assets/[hash][ext][query]",
    filename: isDev
      ? "static/js/[name].bundle.js"
      : "static/js/[name].[contenthash:8].bundle.js",
    // 动态导入资源
    chunkFilename: isDev
      ? "static/js/[name].chunk.js"
      : "static/js/[name].[contenthash:8].chunk.js",
    // webpack5内置了 clean-webpack-plugin,只需将 clean 设置为 true
    clean: true,
    pathinfo: false, // 关闭 Webpack 在输出的 bundle 中生成路径信息
  },

  resolve: {
    extensions: [".js", ".json", ".jsx", ".ts", ".css", ".tsx"],
    alias: {
      "@": SRC_PATH,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$|\.scss$/i, // 指定的文件类型
        include: [SRC_PATH], // 匹配 src 目录下的所有文件
        exclude: /node_module/, // 排除 node_module 目录下的文件
        use: [
          // 如果是开发环境使用 style-loader,生产环境则使用 mini-css-extract-plugin
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: isDev, // 在开发环境下开启
              modules: {
                mode: "local",
                auto: true,
                exportGlobals: true,
                localIdentName: isDev
                  ? "[path][name]__[local]--[hash:base64:5]"
                  : "[local]--[hash:base64:5]",
                localIdentContext: SRC_PATH,
                exportLocalsConvention: "camelCase",
              },
              // 该选项允许你配置在 css-loader 之前有多少 loader 应用于 @imported 资源与 CSS 模块/ICSS 导入。
              importLoaders: 2,
            },
          },
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(tsx?|jsx?)$/,
        include: [path.resolve(__dirname, "../", "src")],
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          cacheCompression: false, // 缓存不压缩
          plugins: [
            isDev && "react-refresh/babel", // 激活 js 的 HMR
          ].filter(Boolean),
        },
        exclude: [/node_modules/, /public/, /(.|_)min\.js$/],
      },
      {
        test: /\.(jpe?g|png|gif|webp|svg|mp4)$/,
        type: "asset",
        // 文件生成路径
        generator: {
          filename: "./images/[hash:8][ext][query]",
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb会被压缩成base64
          },
        },
      },
      // 处理字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "./assets/fonts/[hash][ext][query]",
        },
      },
    ],
  },
  plugins: [
    // 解决babel-loader无法检查ts类型错误问题
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    //   定义全局常量
    new DefinePlugin({
      BASE_URL: '"./"',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../", "public/index.html"), // 指定生成的模板
      filename: "index.html",
      title: "moment", // html中的title
      inject: true, // script标签存放位置
      hash: true,
      minify: isDev
        ? false
        : {
            // https://github.com/terser/html-minifier-terser#options-quick-reference
            removeComments: true, // 删除注释
            collapseWhitespace: true, //是否去除空格
            minifyCSS: true, // 压缩 HTML 中的 css 代码
            minifyJS: true, // 压缩 HTML 中出现的 JS 代码
            caseSensitive: true, // 区分大小写
            removeRedundantAttributes: true, // 当值与默认值匹配时删除属性。
            removeEmptyAttributes: true, // 删除所有只有空白值的属性
            removeStyleLinkTypeAttributes: true, // 从样式和链接标签中删除type="text/css"。其他类型属性值保持不变
            removeScriptTypeAttributes: true, // 从脚本标签中删除type="text/javascript"其他类型属性值保持不变
            useShortDoctype: true, // 将文档类型替换为短(HTML5)文档类型
          },
    }),
    //  解决模块循环引入问题
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      include: /src/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
    new ESLintPlugin({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      context: path.resolve(__dirname, "../src"),
      exclude: "node_modules",
      cache: true, // 开启缓存
      // 缓存目录
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/.eslintCache"
      ),
    }),
    new WebpackBar({
      color: "green",
      basic: false,
      profile: false,
    }),
  ],
};
