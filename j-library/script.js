/*!
 * J Library
 * https://github.com/jasssonpet/demos/tree/gh-pages/j-library
 *
 * Copyright 2013 jasssonpet
 * Released under the MIT license
 */

// # J Library With Sample Plugin

// ## J library

/*jshint newcap: false */

// Everything inside is visible only in the module.
var J = (function() {
    'use strict';

    var _singleTag = /^<(\w+)\s*\/>$/

    // ### Helper functions

    // Checks if the object is a DOM Node.
    function _isNode(obj) {
        return obj instanceof Node
    }

    // Checks if the object is a string.
    function _isString(obj) {
        return typeof obj === 'string'
    }

    function _isTag(str) {
        return _singleTag.test(str)
    }

    function _create(str) {
        var tag = str.match(_singleTag)[1]

        return document.createElement(tag)
    }

    // Works like `Array.protype.concat()` but doesn't create a new array.
    //
    //     var source = [1, 2]
    //
    //     _addRange(source, [3, 4]) // Now source is [1, 2, 3, 4]
    function _addRange(source, elements) {
        J.each(elements, function(el) {
            source.push(el)
        })

        return source
    }

    // Finds all elements, that match the CSS selector and are subelements of `context`.
    //
    //     _find('h1, p', '#wrapper') // Matches #wrapper h1, #wrapper p
    function _find(selector, context) {
        var result = []

        J.each(context, function(el) {
            _addRange(result, el.querySelectorAll(selector))
        })

        return result
    }

    // ### Constructor

    // The constructor accepts a string `J('p, div')` or a DOM Node `J(document.getElementById('id'))`.
    var J = function(selector, context) {
        // This check allows us to make new instances without the `new` keyword.
        //
        //     J('p') // Same as new J('p')
        if (!(this instanceof J)) return new J(selector, context)

        // If there is no context specified, use the root element (`html` in case of an *.html file).
        context = context && context.elements || [document.documentElement]

        // Saves the matched elements as an array in the `elements` property.
        this.elements =
            _isNode(selector)   && [selector] ||
            _isTag(selector)    && [_create(selector)] ||
            _isString(selector) && _find(selector, context)
    }

    // ### Prototype

    // All methods in the prototype are available to all `J` instances.
    //
    // *[Chaining](http://en.wikipedia.org/wiki/Fluent_interface)* is possible with `return this` at the end of every method.
    //
    //     var el = J('p')
    //
    //     el.hide()
    //     el.each()
    //     el.on()
    //
    // Is the same as
    //
    //     J('p').hide().each().on()
    J.prototype =
        // Executes the given callback function for every element.
        { each: function(callback) {
            J.each(this.elements, callback)

            return this
        }

        // Attaches an event listener to every element.
        , on: function(event, callback) {
            return this.each(function(el) {
                el.addEventListener(event, callback, false)
            })
        }

        // **TODO**: Add `mouseenter` event to non-IE browsers.
        , mouseenter: function(callback) {
            return this.on('mouseover', callback)
        }

        // **TODO**: Add `mouseleave` event to non-IE browsers.
        , mouseleave: function(callback) {
            return this.on('mouseout', callback)
        }

        // Clones each element and add it to all current elements.
        , append: function(elements) {
            return this.each(function(el) {
                elements.each(function(appendedElement) {
                    el.appendChild(appendedElement.cloneNode(true))
                })
            })
        }
    }

    ;(function() {
        // Gets the value of the CSS property for the first element.
        function _getCSS(self, prop) {
            var el = self.elements[0]

            return getComputedStyle(el).getPropertyValue(prop)
        }

        // Sets the CSS property for every element to the given value.
        function _setCSS(self, prop, value) {
            return self.each(function(el) {
                el.style[prop] = value
            })
        }

        // Get or set the CSS property.
        J.prototype.css = function(property, value) {
            return value == null ?
                _getCSS(this, property) :
                _setCSS(this, property, value)
        }
    }())

    ;(function() {
        function _getText(self) {
            var ret = ''

            self.each(function(el) {
                ret += el.textContent
            })

            return ret
        }

        function _setText(self, text) {
            return self.each(function(el) {
                el.textContent = text
            })
        }

        J.prototype.text = function(text) {
            return text == null ?
                _getText(this) :
                _setText(this, text)
        }
    }())

    ;(function() {
        // Function helper for the `show` and `hide` methods.
        //
        // **TODO**: Restore the original display (`inline, table ...`).
        function _showHide(self, show) {
            return self.css('display', show ? 'block' : 'none')
        }

        // Restores the previous `display` property.
        J.prototype.show = function() {
           return _showHide(this, true)
        }

        // Saves the current CSS `display` property of each element and sets it to `none`.
        J.prototype.hide = function() {
            return _showHide(this, false)
        }
    }())

    // ### Static Methods

    J.repeat = function(string, times) {
        var result = ''

        while (times--)
            result += string

        return result
    }

    ;(function() {
        function _makeMissing(string, length, character) {
            return J.repeat(character || ' ', length - string.length)
        }

        J.padLeft = function(string, length, character) {
            return _makeMissing(string, length, character) + string
        }

        J.padRight = function(string, length, character) {
            return string + _makeMissing(string, length, character)
        }
    }())

    J.range = function(min, max) {
        if (arguments.length === 1) return J.range(0, min)

        var result = new Array(max - min + 1)

        return J.each(result, function(el, i) {
            this[i] = min + i
        })
    }

    // Creates a random integer in the range [min, max] or [0, min]
    J.random = function(min, max) {
        if (arguments.length === 1) return J.random(0, min)

        return min + Math.floor(Math.random() * (max - min + 1))
    }

    // Returns a random RGB color in Hex format (`#FF0A10`)
    J.randomColor = function() {
        var r = J.padLeft(J.random(255).toString(16), 2, '0')
          , g = J.padLeft(J.random(255).toString(16), 2, '0')
          , b = J.padLeft(J.random(255).toString(16), 2, '0')

          , color = ('#' + r + g + b).toUpperCase()

       return color
    }

    J.each = (function() {
        function _eachArray(obj, callback) {
            var i

            for (i = 0; i < obj.length; i++)
                callback.call(obj, obj[i], i)

            return obj
        }

        function _eachObject(obj, callback) {
            var prop

            for (prop in obj)
                if (obj.hasOwnProperty(prop))
                    callback.call(obj, prop, obj[prop])

            return obj
        }

        return function(obj, callback) {
            return obj.length != null ?
                _eachArray(obj, callback) :
                _eachObject(obj, callback)
        }
    }())

    // Exposes the constructor to the global scope.
    return J
}())

// ## J plugin
// Each plugin should extend the `prototype` to make the new methods available to all `J` instances.

// **Usage**:
//
// Use `data-*` for scripting and `class` for styling.
//
//      <div class="menu" data-menu>
//          <a href="#">Menu</a>
//
//          <ul class="menu-content" data-content>
//              <li><a href="#">Menu Item 1</a></li>
//              <li><a href="#">Menu Item 2</a></li>
//              <li><a href="#">Menu Item 3</a></li>
//          </ul>
//      </div>
;(function(J) {
    'use strict';

    J.prototype.menu = (function() {
        var _delay = 500

        return function() {
            this.each(function(el) {
                var self = J(el)

                    // **TODO**: Nested menus.
                  , content = J('[data-content]', self)

                    // Shows the menu after a specific delay.
                  , timer

                // Function helper for the `show` and `hide` methods.
                function _showHide(show) {
                    // Remove the previous timer, when the user triggers the event too rapidly.
                    clearTimeout(timer)

                    timer = setTimeout(function() {
                        content[show ? 'show' : 'hide']()
                    }, _delay)
                }

                // Hides the content at start.
                // Use CSS to do it before the plugin is loaded to avoid jumping.
                content.hide()

                // **TODO**: Touch events.
                self.mouseenter(function() {
                    _showHide(true)
                }).mouseleave(function() {
                    _showHide(false)
                })
            })
        }
    }())

    // Initialize all menus.
    J('[data-menu]').menu()
}(J))
