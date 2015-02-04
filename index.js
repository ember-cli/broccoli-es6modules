var CachingWriter = require('broccoli-caching-writer');
var esperanto = require('esperanto');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var helpers = require('broccoli-kitchen-sink-helpers');
var walkSync = require('walk-sync');

module.exports = CachingWriter.extend({
  enforceSingleInputTree: true,

  init: function() {
    this.transpilerCache = {};
    this.description = 'ES6Modules';

    var formatToFunc = {
      amd: 'toAmd',
      cjs: 'toCjs',
      umd: 'toUmd'
    };

    this.toFormat = esperanto[formatToFunc[this.format || 'amd']];
  },

  updateCache: function(inDir, outDir) {
    this.newTranspilerCache = {};
    walkSync(inDir)
      .forEach(function(relativePath) {
        if (relativePath.slice(-1) !== '/') {
          this.handleFile(inDir, outDir, relativePath);
        }
      }.bind(this));
    this.transpilerCache = this.newTranspilerCache;
  },

  handleFile: function(inDir, outDir, relativePath) {
    var moduleName = relativePath.replace(/\.js$/, '');
    var fullInputPath = path.join(inDir, relativePath);
    var fullOutputPath = path.join(outDir, relativePath);

    var entry = this.transpileThroughCache(
      moduleName,
      fs.readFileSync(fullInputPath, 'utf-8')
    );

    mkdirp.sync(path.dirname(fullOutputPath));
    fs.writeFileSync(fullOutputPath, entry.output);
  },

  transpileThroughCache: function(moduleName, source) {
    var key = helpers.hashStrings([moduleName, source]);
    var entry = this.transpilerCache[key];
    if (entry) {
      return this.newTranspilerCache[key] = entry;
    }
    try {
      return this.newTranspilerCache[key] = {
        output: this.toFormat(
          source,
          this.generateEsperantoOptions(moduleName)
        ).code
      };
    } catch(err) {
      err.file = moduleName;
      throw err;
    }
  },

  generateEsperantoOptions: function(moduleName) {
    var providedOptions = this.esperantoOptions || {};
    var result = {
      _evilES3SafeReExports: false,
      absolutePaths: true,
      strict: true,
      name: moduleName
    };

    for (var keyName in providedOptions) {
      result[keyName] = providedOptions[keyName];
    }

    result.amdName = moduleName;

    return result;
  }
});
