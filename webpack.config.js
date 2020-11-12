/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const isDev = process.env.NODE_ENV !== "production";

/* eslint-enable */

const outputPath = path.resolve(__dirname, "dist");
const resolveExt = [".json", ".js", ".jsx", ".css", ".ts", ".tsx"];

var main = {
  mode: isDev ? "development" : "production",
  target: "electron-main",
  devtool: isDev ? "source-map" : false,
  entry: path.join(__dirname, "src", "index"),
  output: {
    filename: "index.js",
    path: outputPath,
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: resolveExt
  },
  plugins: [],
};

var renderer = {
  mode: isDev ? "development" : "production",
  target: "electron-renderer",
  devtool: isDev ? "source-map" : false,
  entry: path.join(__dirname, "src", "renderer", "index"),
  output: {
    filename: "renderer.js",
    path: path.resolve(outputPath),
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        include: [path.resolve(__dirname, "src")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: resolveExt
  },
  plugins: [    
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "renderer", "index.html"),
          to: path.resolve(__dirname, outputPath),
        },
      ],
    }),],
};

module.exports = [main, renderer];
