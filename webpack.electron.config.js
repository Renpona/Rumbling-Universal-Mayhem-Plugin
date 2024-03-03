const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

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
    mode: 'development',
    devtool: 'inline-source-map',
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
          { from: "README.md", to: "README.md" },
          { from: "src/electron/index.html", to: "index.html" },
          { from: "src/electron/style.css", to: "style.css" },
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
    mode: 'development',
    devtool: 'inline-source-map',
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
    mode: 'development',
    devtool: 'inline-source-map',
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
      filename: './electronPreload.js',
      path: path.resolve(__dirname, 'dist'),
    },
    name: 'renderer',
    entry: './src/electron/electronPreload.ts',
    dependencies: ['backend'],
    target: 'electron-preload',
    mode: 'development',
    devtool: 'inline-source-map',
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