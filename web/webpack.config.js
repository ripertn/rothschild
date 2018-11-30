var ExtractTextPlugin = require("extract-text-webpack-plugin")
var path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: './app.js',
  output: { filename: 'bundle.js' , path: path.join(__dirname, '../priv/static' ) }, 
  plugins: [
    new ExtractTextPlugin({filename: "main.css"}),
  ],
  module: {
    loaders: [
      {
        test: /.js?$/,
        use: [
          {loader: "babel-loader",options: {
            presets: ['stage-0','es2015','react']
          }},
          {
            loader: "babel-loader",
            options: {
              presets: [['jsxz',{dir: "nathan-dashboard.webflow"}]],
              parserOpts: {
                plugins: [
                  "jsx","flow","doExpressions","objectRestSpread","decorators","classProperties",
                  "exportExtensions","asyncGenerators","functionBind","functionSent","dynamicImport"
                ]
              }
            }
          }
        ]
          //loader: 'babel-loader',
          //exclude: /node_modules/,
          //query: {
          //presets: ['es2015', 'react']
      },
      { 
        test: /\.css$/, 
        use:  ExtractTextPlugin.extract({use: "css-loader"})
      }
    ]
  },
}