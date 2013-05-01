define(function(require) {
    'use strict';

    var utils = require('utils')
    var GameObject = require('GameObject')

    function Food(position) {
        GameObject.call(this, [[ true ]], position, utils.randomColor())
    }

    utils.inherit(Food, GameObject)

    Food.prototype.respondToCollision = function() {
        this.isDestroyed = true
    }

    return Food
})
