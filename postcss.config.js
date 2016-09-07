/**
 * Shared bundle for base PostCSS plugin settings for parsing styles
 *
 * @package: postcss.sassy.config
 * @author:  pospi <sam@everledger.io>
 * @since:   2016-08-26
 */

const {
  PROJECT_DIR,  // path.resolve(__dirname, '.');
  BUILD_DIR,    //path.join(PROJECT_DIR, 'build');
} = process.env;

const fs = require('fs');
const path = require('path');

// Optionally up a library of custom functions to use in your CSS.
// Simply export a dictionary of the form { [key: string]: (...Array<any>) => string }
// You can test this by prepending `FUNCS_FILE=example/muicss-funcs` to execution of this script.

const sassFunctions = process.env.FUNCS_FILE
  ? require(path.resolve(__dirname, process.env.FUNCS_FILE))
  : {};

// Get postcss requirements

const postcssModules = require('postcss-modules');
const partialImport = require('postcss-import');
const mixins = require('postcss-sassy-mixins');
const advancedVariables = require('postcss-advanced-variables');
const customMedia = require('postcss-custom-media');
const customProperties = require('postcss-custom-properties');
const mediaMinmax = require('postcss-media-minmax');
const colorFunctions = require('postcss-sass-color-functions');
const customFunctions = require('postcss-functions');
const nesting = require('postcss-nesting');
const nested = require('postcss-nested');
const customSelectors = require('postcss-custom-selectors');
const atroot = require('postcss-atroot');
const propertyLookup = require('postcss-property-lookup');
const extend = require('postcss-extend');
const selectorMatches = require('postcss-selector-matches');
const selectorNot = require('postcss-selector-not');
const stripInline = require('postcss-strip-inline-comments');
const autoprefixer = require('autoprefixer');
const postCSSModuleComponents = require('postcss-modules-component-plugin');

// You can add your own paths here to default them to global CSS namespace
postCSSModuleComponents.setGlobalModulesWhitelist([
  /\/node_modules\//, // <- this is the default
]);


// helpers

function getCssMetaFileName(cssFileName) {
  return cssFileName.replace(PROJECT_DIR, '').replace(/\//g, '$').replace(/\.scss$/, '') + '.json';
}


// init plugins

const moduleLoaderPlugin = postcssModules({
  generateScopedName: function(name, filename, css) {
    // generate class names using file path detection from the plugin
    const res = postCSSModuleComponents.scopedName(name, filename, css);
    return res;
  },
  getJSON: function(cssFileName, json) {
    // write output files so other build tools can integrate with them
    fs.writeFileSync(path.join(BUILD_DIR, getCssMetaFileName(cssFileName)), JSON.stringify(json));
    // pass through plugin so that it can track classes for later output
    return postCSSModuleComponents.writer(cssFileName, json);
  },
});

// Export a function we can use on a Webpack instance to generate the PostCSS plugin stack
// If you're not using Webpack, pass `null`.

function getPostCSSPlugins(webpack, format = null) {
  // Allow custom className formats (eg. `[hash:base64:7]` for production)
  if (format) {
    postCSSModuleComponents.setLocalModuleNameFormat(format);
  }

  // :IMPORTANT: the order of this array will be the execution order of plugins!
  return [
    // Compile import dependency graph
    partialImport({
      extension: 'scss',
      addDependencyTo: webpack,
      plugins: [moduleLoaderPlugin],  // handle modules first so we can determine filename to handle global mode
    }),
    // handle modules after combining into partials in order to get final classnames
    // :TODO: some issues with this would be resolved if two instances of the plugin were possible
    moduleLoaderPlugin,
    mixins(),
    advancedVariables(),
    customMedia(),
    customProperties(),
    mediaMinmax(),
    nesting(),
    nested(),
    customSelectors(),
    atroot(),
    propertyLookup({ logLevel: 'warn' }),
    extend(),
    selectorMatches(),
    selectorNot(),
    customFunctions({ // MUST go after variable / mixin handling in order to receive final values
      functions: sassFunctions,
    }),
    colorFunctions(), // MUST go after `customFunctions` as the output from them is often used as input to color fns
    stripInline(),
    // Handle outdated browser compatibility
    autoprefixer({ browsers: ['last 2 versions'] }),
  ];
}


module.exports = {
  getPostCSSPlugins,
};
