// # J Library With Sample Plugin

// ## J library

/*jshint newcap: false */

// Everything inside is visible only in the module.
var J = (function() {
    'use strict';

    // ### Helper functions

    // Checks if the object is a DOM Node.
    function _isNode(obj) {
        return obj instanceof Node
    }

    // Checks if the object is a string.
    function _isString(obj) {
        return typeof obj === 'string'
    }

    // Works like `Array.protype.concat()` but doesn't create a new array.
    //
    //     var source = [1, 2]
    //
    //     _addRange(source, [3, 4]) // Now source is [1, 2, 3, 4]
    function _addRange(source, elements) {
        var i

        for (i = 0; i < elements.length; i++)
            source.push(elements[i])

        return source
    }

    // Finds all elements, that match the CSS selector and are subelements of `context`.
    //
    //     _find('h1, p', '#wrapper') // Matches #wrapper h1, #wrapper p
    function _find(selector, context) {
        var result = []

        context.forEach(function(el) {
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
        if (!(this instanceof J))
            return new J(selector, context)

        // If there is no context specified, use the root element (`html` in case of an *.html file).
        context = context && context.elements || [document.documentElement]

        // Saves the matched elements as an array in the `elements` property.
        this.elements =
            _isNode(selector)   && [selector] ||
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
    J.prototype = (function() {
        // Function helper for the `show` and `hide` methods.
        //
        // **TODO**: Restore the original display (`inline, table ...`).
        function _showHide(self, show) {
            return self.css('display', show ? 'block' : 'none')
        }

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

        var prototype =
            // Executes the given callback function for every element.
            { each: function(callback) {
                this.elements.forEach(callback)

                return this
            }

            // Restores the previous `display` property.
            , show: function() {
               return _showHide(this, true)
            }

            // Saves the current CSS `display` property of each element and sets it to `none`.
            , hide: function() {
                return _showHide(this, false)
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

            // Get or set the CSS property.
            , css: function(property, value) {
                return value == null ?
                    _getCSS(this, property) :
                    _setCSS(this, property, value)
            }
        }

        return prototype
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
;(function($) {
    'use strict';

    $.prototype.menu = (function() {
        var _delay = 500

        return function() {
            this.each(function(el) {
                var self = $(el)

                    // **TODO**: Nested menus.
                  , content = $('[data-content]', self)

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
    $('[data-menu]').menu()
}(J))
