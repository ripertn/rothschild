var ExtractTextPlugin = require("extract-text-webpack-plugin")
var path = require('path')

var client_config = {
  devtool: 'source-map',
  // entry: './app.js',
  entry: "reaxt/client_entry_addition",
  // output: { filename: 'bundle.js' , path: path.join(__dirname, '../priv/static' ) }, 
  output: { 
    filename: 'client.[hash].js', 
    path: path.join(__dirname, '../priv/static' ),
    publicPath: '/public/'
  }, 
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
              presets: [['jsxz',{dir: "rothschildish.webflow"}]],
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

var server_config = Object.assign(Object.assign({},client_config),{
  target: "node",
  entry: "reaxt/react_server",
  output: {
    path: path.join(__dirname, '../priv/react_servers'), //typical output on the default directory served by Plug.Static
    filename: 'server.js' //dynamic name for long term caching, or code splitting, use WebPack.file_of(:main) to get it
  },
 })

 module.exports = [client_config, server_config]