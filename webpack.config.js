/* eslint-disable @typescript-eslint/no-var-requires */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const isDev = process.env.NODE_ENV !== "production";

/* eslint-enable */

const outputPath = path.resolve(__dirname, "dist");
const resolveExt = [".json", ".js", ".jsx", ".css", ".ts", ".tsx"];

var renderer = {
  mode: isDev ? "development" : "production",
  devtool: isDev ? "source-map" : false,
  entry: path.join(__dirname, "src", "index"),
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
          from: path.resolve(__dirname, "src", "index.html"),
          to: path.resolve(__dirname, outputPath),
        },
        {
          from: path.resolve(__dirname, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.js"),
          to: path.resolve(__dirname, outputPath),
        }
      ],
    }),
  ],
  devServer: {
    contentBase: outputPath
  }
};

module.exports = [renderer];
