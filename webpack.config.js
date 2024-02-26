const { default: nodeTest } = require('node:test');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/intifaceConnector.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production",
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: {
      dry: false,
      //keep: /configs\//
    },
  },
  target: "node",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "config", to: "config" },
        { from: "intiface", to: "intiface" },
      ],
    }),
  ],
};
