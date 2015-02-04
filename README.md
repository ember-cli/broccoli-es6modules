#broccoli-es6modules
This is a broccoli filter that transpiles every file in its input tree
from ES6 to AMD, CommonJS, or UMD.

In combination with broccoli-funnel (for choosing which files you
want) and broccoli-sourcemap-concat, we can build a flexible pipeline
for distributing ES6 sourcecode to the browser.

## Examples

```javascript
//By default compiles to AMD
var transpileES6 = require('broccoli-es6modules');
var tree = transpileES6(originalTree);

//Compile to CommonJS or UMD
var transpileES6 = require('broccoli-es6modules');
var cjsTree = transpileES6(originalTree, {
  format: 'cjs'
});
var umdTree = transpileES6(originalTree, {
  format: 'umd'
});
```