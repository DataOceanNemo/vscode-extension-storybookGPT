//@ts-check

"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

const envLocalPath = path.resolve(__dirname, "../.env.local");

const config = [
  {
    name: "webview",
    target: "web",
    entry: "./src/webview/index.tsx",
    output: {
      filename: "webview.js",
      path: path.resolve(__dirname, "../dist"),
    },
    devtool: "source-map",
    resolve: {
      extensions: [".ts", ".js", ".tsx", ".jsx"],
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
            },
          ],
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
      ],
    },
    performance: {
      hints: false,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/webview/public/index.html",
        filename: "index.html",
        favicon: "./src/webview/public/favicon.ico",
      }),
      new Dotenv({
        path: envLocalPath,
      }),
    ],
    devServer: {
      compress: true,
      port: 9000,
      hot: true,
      allowedHosts: "all",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  },
];

module.exports = (env, argv) => {
  for (const configItem of config) {
    configItem.mode = argv.mode;

    if (argv.mode === "production") {
      configItem.devtool = "hidden-source-map";
    }
  }

  return config;
};
