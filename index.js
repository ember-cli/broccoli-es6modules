var Transpile = require('./transpile');
var SourceMapConcat = require('broccoli-sourcemap-concat');

module.exports = function(inputTree, options) {
  return new SourceMapConcat(new Transpile(inputTree, options), {
    header: options.loaderFile,
    inputFiles: options.inputFiles,
    outputFile: options.outputFile
  });
};
