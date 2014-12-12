define("outer", 
  ["npm:vendor/monster","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var monster = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    __exports__["default"] = Ember.Route.extend({
      actions: {
        checkCookie: function() {
          if (monster.get('magical')) {
            alert('you have a magic cookie');
          }
        }
      }
    });
  });