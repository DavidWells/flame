var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: [ 'babel' ],
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
}

// When inside Redux repo, prefer src to compiled version.
// You can safely delete these lines in your project.
var flameSrc = path.join(__dirname, '..', '..', 'src')
var flameNodeModules = path.join(__dirname, '..', '..', 'node_modules')
var fs = require('fs')
if (fs.existsSync(flameSrc) && fs.existsSync(flameNodeModules)) {
  // Resolve Redux to source
  module.devtool = 'inline-source-map';
  module.exports.resolve = { alias: { 'flame': flameSrc } }
  // Compile Redux from source
  module.exports.module.loaders.push({
    test: /\.jsx?$/,
    loaders: ['babel'],
    include: flameSrc
  })
}

// var path = require('path')
// var webpack = require('webpack')

// module.exports = {
//   devtool: 'inline-source-map',
//   entry: [
//     'webpack-dev-server/client?http://0.0.0.0:3000',
//     'webpack/hot/only-dev-server',
//     './index'
//   ],
//   output: {
//     path: path.join(__dirname, 'dist'),
//     filename: 'bundle.js',
//     publicPath: '/static/'
//   },
//   plugins: [
//     new webpack.optimize.OccurenceOrderPlugin(),
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoErrorsPlugin()
//   ],
//   module: {
//     loaders: [
//       {
//         test: /\.jsx?$/,
//         exclude: /node_modules/,
//         loader: 'react-hot',
//         include: __dirname,
//       },
//       {
//         test: /\.jsx?$/,
//         exclude: /node_modules/,
//         loader: 'babel',
//         include: __dirname,
//       },
//     ],
//   },
// }


// // // When inside Redux repo, prefer src to compiled version.
// // // You can safely delete these lines in your project.
// // var flameSrc = path.join(__dirname, '..', '..', 'src')
// // var flameNodeModules = path.join(__dirname, '..', '..', 'node_modules')
// // var fs = require('fs')
// // if (fs.existsSync(flameSrc) && fs.existsSync(flameNodeModules)) {
// //   // Resolve Redux to source
// //   module.exports.resolve = { alias: { 'flame': flameSrc } }
// //   // Compile Redux from source
// //   module.exports.module.loaders.push({
// //     test: /\.jsx?$/,
// //     loader: 'babel',
// //     include: flameSrc
// //   })
// // }
