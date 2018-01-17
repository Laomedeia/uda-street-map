const path = require("path"); // 导入路径包
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require("webpack");

module.exports = {
  //entry: './src/js/app.js', //入口文件
  entry: __dirname + "/src/main.js",
  output: {
    path: __dirname + "/dist", // publicPath: '/assets/', // 指定资源文件引用的目录，也就是说用/assests/这个路径指代path，开启这个配置的话，index.html中应该要引用的路径全部改为'/assets/...'
    //path: path.resolve(__dirname, 'build'), // 指定打包之后的文件夹
    filename: 'bundle.js' // 指定打包为一个文件 bundle.js
    // filename: "[name].js" // 可以打包为多个文件
  },
  // 使用loader模块
  module: {
    loaders:[
      { 
        test: /\.css$/, 
        loader: 'style-loader!css-loader' 
      },
      {
          test: /\.js[x]?$/,
          exclude: '/node_modules/',
          loader: 'babel-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
            'file-loader?hash=sha512&digest=hex&name=/src/images/[name].[ext]',
            'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new CopyWebpackPlugin([
      { from: 'src/images', to: 'src/images' }
    ]),
    new webpack.HotModuleReplacementPlugin(),
  ]
};
