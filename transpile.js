var CachingWriter = require('broccoli-caching-writer');
var ES6Transpiler = require('es6-module-transpiler').Compiler;
var helpers = require('broccoli-kitchen-sink-helpers');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports = CachingWriter.extend({
  enforceSingleInputTree: true,

  init: function(inputTree, options) {
    CachingWriter.apply(this, arguments);
    if (!options || !options.inputFiles) {
      throw new Error("must specify inputFiles");
    }
    this.options = options;
  },

  updateCache: function(inDir, outDir) {
    helpers.multiGlob(this.options.inputFiles, {cwd: inDir})
      .forEach(function(relativePath) {
        this.handleFile(inDir, outDir, relativePath);
      }.bind(this));
  },

  handleFile: function(inDir, outDir, relativePath) {
    var moduleName = relativePath.replace(/\.js$/, '');
    if (this.shouldIgnore(moduleName)) {
      return;
    }
    var fullInputPath = path.join(inDir, relativePath);
    var fullOutputPath = path.join(outDir, relativePath);
    var compiler = new ES6Transpiler(fs.readFileSync(fullInputPath, 'utf-8'), moduleName);
    mkdirp.sync(path.dirname(fullOutputPath));
    fs.writeFileSync(fullOutputPath, compiler.toAMD());
  },

  shouldIgnore: function(moduleName) {
    var ignored = this.options.ignoredModules;
    if (typeof(ignored) === 'function') {
      return ignored(moduleName);
    }
    if (ignored) {
      return ignored.indexOf(moduleName) !== -1;
    }
    return false;
  }

});
