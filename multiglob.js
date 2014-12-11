// the multiGlob from broccoli-kitchen-sink-helpers is currently
// broken due to upstream changes in glob. Putting this here so I can
// lock down my own glob version directly, until I can switch to Funnel.

var glob = require('glob');

module.exports = function(globs, globOptions) {
  if (!Array.isArray(globs)) {
    throw new TypeError("multiGlob's first argument must be an array");
  }
  var options = {
    nomount: true,
    strict: true
  };
  for (var key in globOptions) {
    if (globOptions.hasOwnProperty(key)) {
      options[key] = globOptions[key];
    }
  }

  var pathSet = {};
  var paths = [];
  for (var i = 0; i < globs.length; i++) {
    if (options.nomount && globs[i][0] === '/') {
      throw new Error('Absolute paths not allowed (`nomount` is enabled): ' + globs[i]);
    }
    var matches = glob.sync(globs[i], options);
    if (matches.length === 0) {
      throw new Error('Path or pattern "' + globs[i] + '" did not match any files');
    }
    for (var j = 0; j < matches.length; j++) {
      if (!pathSet[matches[j]]) {
        pathSet[matches[j]] = true;
        paths.push(matches[j]);
      }
    }
  }
  return paths;
};
