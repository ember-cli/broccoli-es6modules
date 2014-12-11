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
    this.seen = {};
    helpers.multiGlob(this.options.inputFiles, {cwd: inDir})
      .forEach(function(relativePath) {
        this.handleFile(inDir, outDir, relativePath);
      }.bind(this));
  },

  handleFile: function(inDir, outDir, relativePath) {
    var moduleName = relativePath.replace(/\.js$/, '');
    if (this.seen[moduleName] || this.shouldIgnore(moduleName)) {
      return;
    }
    this.seen[moduleName] = true;
    var fullInputPath = path.join(inDir, relativePath);
    var fullOutputPath = path.join(outDir, relativePath);
    var compiler = new ES6Transpiler(fs.readFileSync(fullInputPath, 'utf-8'), moduleName);
    patchRelativeImports(moduleName, compiler);
    mkdirp.sync(path.dirname(fullOutputPath));
    fs.writeFileSync(fullOutputPath, compiler.toAMD());
    compiler.imports.forEach(function (importNode) {
      var moduleName = importNode.source.value;
      this.handleFile(inDir, outDir, moduleName.replace(/\.js$/,'') + '.js');
    }.bind(this));
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


// This function based on
// http://github.com/joliss/broccoli-es6-concatenator. MIT Licensed,
// Copyright 2013 Jo Liss.
function patchRelativeImports(moduleName, compiler) {
  for (var i = 0; i < compiler.imports.length; i++) {
    var importNode = compiler.imports[i];
    if ((importNode.type !== 'ImportDeclaration' &&
         importNode.type !== 'ModuleDeclaration') ||
        !importNode.source ||
        importNode.source.type !== 'Literal' ||
        !importNode.source.value) {
      throw new Error('Internal error: Esprima import node has unexpected structure');
    }
    if (importNode.source.value.slice(0, 1) === '.') {
      importNode.source.value = path.join(moduleName, '..', importNode.source.value).replace(/\\/g, '/');
    }
  }
}
