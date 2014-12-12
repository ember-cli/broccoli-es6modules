define("inner/first", 
  ["something","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Something = __dependency1__["default"];

    function meaningOfLife() {
      new Something();
      throw new Error(42);
    }

    __exports__.meaningOfLife = meaningOfLife;function boom() {
      throw new Error('boom');
    }

    __exports__.boom = boom;
  });