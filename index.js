var Transpile = require('./transpile');
var SourceMapConcat = require('broccoli-sourcemap-concat');
var Funnel = require('broccoli-funnel');
var merge = require('broccoli-merge-trees');

module.exports = function(inputTree, options) {
  var transpiled = new Transpile(inputTree, options);

  var legacies = [];
  if (options.loaderFile) {
    legacies.push(options.loaderFile);
  }
  if (options.legacyFilesToAppend) {
    legacies = legacies.concat(options.legacyFilesToAppend);
  }

  var legacyTree = new Funnel(inputTree, { files: legacies });
  var both = merge([transpiled, legacyTree]);
  return new SourceMapConcat(both, {
    headerFiles: options.loaderFile ? [options.loaderFile] : null,
    inputFiles: options.inputFiles,
    outputFile: options.outputFile,
    footerFiles: options.legacyFilesToAppend
  });
};
