/* global describe, afterEach, it, expect */

var expect = require('chai').expect;  // jshint ignore:line
var ES6 = require('..');
var RSVP = require('rsvp');

RSVP.on('error', function(err){
  throw err;
});

var fs = require('fs');
var path = require('path');
var broccoli = require('broccoli');
var mkdirp = require('mkdirp');

var fixtures = path.join(__dirname, 'fixtures');
var builder;

describe('broccoli-es6modules', function() {
  it('transpiles every file', function() {
    var tree = new ES6(fixtures);
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('outer.js').in(result);
      expectFile('reexport.js').in(result);
      expectFile('inner/first.js').in(result);
    });
  });

  it('uses esperantoOptions if provided', function() {
    var tree = new ES6(fixtures, {
      esperantoOptions: {
        _evilES3SafeReExports: true
      }
    });

    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('reexport-es3.js').in(result);
    });
  });

  it('complies to cjs if format = cjs', function() {
    var tree = new ES6(fixtures, {
      format: 'cjs'
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('outer.js', 'cjs').in(result);
      expectFile('reexport.js', 'cjs').in(result);
      expectFile('inner/first.js', 'cjs').in(result);
    });
  });

  it('complies to cjs if format = umd', function() {
    var tree = new ES6(fixtures, {
      format: 'umd'
    });
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('outer.js', 'umd').in(result);
      expectFile('reexport.js', 'umd').in(result);
      expectFile('inner/first.js', 'umd').in(result);
    });
  });

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });
});

function expectFile(filename, format) {
  function inner(result) {

    format = format || 'amd';

    var actualContent = fs.readFileSync(path.join(result.directory, filename), 'utf-8');
    mkdirp.sync(path.dirname(path.join(__dirname, 'actual', filename)));
    fs.writeFileSync(path.join(__dirname, 'actual', filename), actualContent);

    var expectedContent;
    try {
      expectedContent = fs.readFileSync(path.join(__dirname, 'expected', format, filename), 'utf-8');
    } catch (err) {
      console.warn("Missing expcted file: " + path.join(__dirname, 'expected', format, filename));
    }

    expect(actualContent).to.equal(expectedContent, "discrepancy in " + filename);
  }
  return { in: inner };
}
