var CachingWriter = require('broccoli-caching-writer');
var ES6Transpiler = require('es6-module-transpiler').Compiler;
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var helpers = require('broccoli-kitchen-sink-helpers');
var multiGlob = require('./multiglob');

module.exports = CachingWriter.extend({
  enforceSingleInputTree: true,

  init: function(inputTree, options) {
    if (!options || !options.inputFiles) {
      throw new Error("must specify inputFiles");
    }
    this.options = options;
    this.transpilerCache = {};
  },

  updateCache: function(inDir, outDir) {
    this.seen = {};
    this.newTranspilerCache = {};
    multiGlob(this.options.inputFiles, {cwd: inDir})
      .forEach(function(relativePath) {
        this.handleFile(inDir, outDir, relativePath);
      }.bind(this));
    this.transpilerCache = this.newTranspilerCache;
  },

  handleFile: function(inDir, outDir, relativePath) {
    var moduleName = relativePath.replace(/\.js$/, '');
    if (this.seen[moduleName] || this.shouldIgnore(moduleName)) {
      return;
    }
    this.seen[moduleName] = true;

    var fullInputPath = path.join(inDir, relativePath);
    var fullOutputPath = path.join(outDir, relativePath);

    var entry = this.transpileThroughCache(
      moduleName,
      fs.readFileSync(fullInputPath, 'utf-8')
    );

    mkdirp.sync(path.dirname(fullOutputPath));
    fs.writeFileSync(fullOutputPath, entry.amd);
    entry.imports.forEach(function (filename) {
      this.handleFile(inDir, outDir, filename);
    }.bind(this));
  },

  transpileThroughCache: function(moduleName, source) {
    var key = helpers.hashStrings([moduleName, source]);
    var entry = this.transpilerCache[key];
    if (entry) {
      return this.newTranspilerCache[key] = entry;
    }
    var compiler = new ES6Transpiler(source, moduleName);
    patchRelativeImports(moduleName, compiler);
    var imports = compiler.imports.map(function (importNode) {
      return importNode.source.value.replace(/\.js$/,'') + '.js';
    });
    return this.newTranspilerCache[key] = {
      amd: compiler.toAMD(),
      imports: imports
    };
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
