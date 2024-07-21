const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const mode = process.env.NODE_ENV.trim();
var devtool = 'inline-source-map';
if (mode == "production") {
  devtool = 'source-map';
}

module.exports = [
  {
    output: {
      filename: './bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    name: 'backend',
    entry: './src/startup.ts',
    target: 'node',
    mode: mode,
    devtool: devtool,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "config", to: "config" },
          { from: "intiface", to: "intiface" },
          { from: "src/electron/index.html", to: "index.html" },
        ],
      }),
    ],
  },
  {
    output: {
      filename: './electronMain.js',
      path: path.resolve(__dirname, 'dist'),
    },
    name: 'main',
    entry: './src/electron/electronMain.ts',
    target: 'electron-main',
    dependencies: ['backend'],
    mode: mode,
    devtool: devtool,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  },
  {
    output: {
      filename: './renderer.js',
      path: path.resolve(__dirname, 'dist'),
    },
    name: 'renderer',
    entry: './src/electron/renderer.ts',
    dependencies: ['backend'],
    target: 'electron-renderer',
    mode: mode,
    devtool: devtool,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                // options...
              }
            }
          ]
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style.css'
      }),
      new webpack.EnvironmentPlugin(['npm_package_version', 'NODE_ENV']),
    ]
  },
  {
    output: {
      filename: './electronPreload.js',
      path: path.resolve(__dirname, 'dist'),
    },
    name: 'renderer',
    entry: './src/electron/electronPreload.ts',
    dependencies: ['backend'],
    target: 'electron-preload',
    mode: mode,
    devtool: devtool,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  },
];