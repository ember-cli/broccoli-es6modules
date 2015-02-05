#broccoli-es6modules
This is a broccoli filter that transpiles every file in its input tree
from ES6 to AMD, CommonJS, or UMD.

In combination with broccoli-funnel (for choosing which files you
want) and broccoli-sourcemap-concat, we can build a flexible pipeline
for distributing ES6 sourcecode to the browser.

## Examples

```javascript
//By default compiles to AMD
var TranspileES6 = require('broccoli-es6modules');
var tree = new TranspileES6(originalTree);

//Compile to CommonJS or UMD
var TranspileES6 = require('broccoli-es6modules');
var cjsTree = new TranspileES6(originalTree, {
  format: 'cjs'
});
```