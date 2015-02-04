(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('npm:vendor/monster'), require('ember')) :
  typeof define === 'function' && define.amd ? define('outer', ['exports', 'npm:vendor/monster', 'ember'], factory) :
  factory((global.outer = {}), global.monster, global.Ember)
}(this, function (exports, monster, Ember) { 'use strict';

  exports['default'] = Ember['default'].Route.extend({
    actions: {
      checkCookie: function() {
        if (monster['default'].get('magical')) {
          alert('you have a magic cookie');
        }
      }
    }
  });

}));