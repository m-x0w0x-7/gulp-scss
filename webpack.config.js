module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  mode: "development",

  // メインのJS
  entry: "./src/js/main.js",
  // 出力ファイル
  output: {
    filename: "main.js"
  },
  module: {
    rules: [
      {
        loader: "babel-loader",
        options: {
          presets: [
            // ES2019 を ES5 に変換
            "@babel/preset-env"
          ]
        }
      }
    ]
  }
}
