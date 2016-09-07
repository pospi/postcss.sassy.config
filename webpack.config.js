/**
 * Brief example config for webpack showing PostCSS integration
 *
 * @package: postcss.sassy.config
 * @author:  pospi <sam@everledger.io>
 * @since:   2016-09-07
 */

const {
  PROJECT_DIR,
  BUILD_DIR,
} = process.env;

// Fix the issue with symlinked directories in node_modules
require('@pospi/appcore/hooks/node-setGlobalIncludePath')(module);

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');

const { getPostCSSPlugins } = require('./postcss.config');
const postCSSModuleComponents = require('postcss-modules-component-plugin');
const syntax = require('postcss-scss');

// Webpack loader config for style files
// :NOTE: loaders are executed RTL
const cssLoaders = [
  // append module class mappings from postcss-modules-component-plugin to css-loader output
  { loader: postCSSModuleComponents.loader() },
  // pass output to css-loader
  { loader: 'css-loader', query: { sourceMap: true, importLoaders: 1 } },
  // run PostCSS to do most preprocessing & cache module classnames in postcss-modules-component-plugin
  { loader: 'postcss-loader' },
];

//------------

module.exports = {
  devServer: {
    hot: true,
    historyApiFallback: true,
    contentBase: BUILD_DIR,
  },
  devtool: 'eval-source-map',
  entry: [
    // :TODO: YOUR ENTRYPOINT FILES HERE
  ],
  module: {
    loaders: [
      // :TODO: ADD YOUR OTHER LOADERS (js, json etc) HERE

      // CSS modules & preprocessing
      {
        test: /\.(css|scss)$/,
        exclude: [/\/node_modules\//],
        // Note we prepend style-loader to handle injection to the browser
        loaders: [{ loader: 'style-loader' }].concat(cssLoaders),
      },
      // Inline any assets < 50KB, otherwise emit hashed files for deployment to CDN
      {
        loader: 'url-loader?limit=50000',
        exclude: [/\/node_modules/],
        test: /\.(gif|jpg|png|woff|woff2|eot|ttf|svg)$/,
      },
    ],
  },
  postcss: function(webp) {
    return {
      plugins: getPostCSSPlugins(webp),
      syntax: syntax,
    };
  },
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    publicPath: '/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.RUNTIME': JSON.stringify('web'),
    }),
    new webpack.ProvidePlugin({
      $: 'zepto-webpack',
    }),
    new HtmlWebpackPlugin({
      template: PROJECT_DIR + "/index.html",
    }),
    new webpack.NamedModulesPlugin(),
    new WebpackNotifierPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  resolve: {
    alias: {
      // :NOTE: does not work with Material UI or react-tap-event-plugin
      // (though I don't think the latter is needed)
      // 'react': 'preact-compat',
      // 'react-dom': 'preact-compat',
    },
    extensions: ["", ".web.jsx", ".web.js", ".jsx", ".js"],
  },
};
