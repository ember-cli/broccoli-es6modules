(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('inner/first')) :
	typeof define === 'function' && define.amd ? define('reexport', ['exports', 'inner/first'], factory) :
	factory((global.reexport = {}), global.meaningOfLife)
}(this, function (exports, meaningOfLife) { 'use strict';

	Object.defineProperty(exports, 'meaningOfLife', { enumerable: true, get: function () { return meaningOfLife['default']; }});

}));