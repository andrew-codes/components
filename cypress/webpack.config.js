const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const path = require("path")

module.exports = {
  output: {
    path: path.join(__dirname, "..", "dist"),
    filename: "components.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  devtool: "inline-source-map",
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(__dirname, "tsconfig.json"),
      },
    }),
  ],
  target: "web",
}
