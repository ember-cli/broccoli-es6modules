var CachingWriter = require('broccoli-caching-writer');
var ES6Transpiler = require('es6-module-transpiler').Compiler;
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
    fs.writeFileSync(fullOutputPath, entry.amd);
  },

  transpileThroughCache: function(moduleName, source) {
    var key = helpers.hashStrings([moduleName, source]);
    var entry = this.transpilerCache[key];
    if (entry) {
      return this.newTranspilerCache[key] = entry;
    }
    try {
      var compiler = new ES6Transpiler(source, moduleName);
      patchRelativeImports(moduleName, compiler);
      return this.newTranspilerCache[key] = {
        amd: compiler.toAMD()
      };
    } catch(err) {
      err.file = moduleName;
      throw err;
    }
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
