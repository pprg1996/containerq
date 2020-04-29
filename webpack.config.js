const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/ContainerQ.ts",
  devtool: "none",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: "babel-loader",
        exclude: "/node_modules/",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
  },
  output: {
    filename: "ContainerQ.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
  },
  externals: {
    "@juggle/resize-observer": "@juggle/resize-observer",
  },
};
