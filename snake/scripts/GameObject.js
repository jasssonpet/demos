define(function() {
    'use strict';

    function GameObject(image, position, color) {
        this.image = image
        this.position = position
        this.color = color || 'lightGray'
    }

    GameObject.prototype =
        { get rows() {
            return this.image.length
        }

        , get cols() {
            return this.image[0].length
        }

        , update: function() {

        }

        , respondToCollision: function() {

        }
    }

    return GameObject
})
