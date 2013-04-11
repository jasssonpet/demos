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

    // ### Constructor

    // The constructor accepts a string `J('p, div')` or a DOM Node `J(document.getElementById('id'))`.
    var J = (function() {
        var _voidTag = /^<(\w+)\s*\/>$/

        // Checks if the object is a DOM Node.
        function _isNode(obj) {
            return obj instanceof Node
        }

        function _isTag(str) {
            return _voidTag.test(str)
        }

        function _create(str) {
            var tag = str.match(_voidTag)[1]

            return document.createElement(tag)
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

        return function(selector, context) {
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
    }())

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

    // Executes the given callback function for every element.
    J.prototype.each = function(callback) {
        J.each(this.elements, callback)

        return this
    }

    // #### Events
    ;(function () {
        // Attaches an event listener to every element.
        J.prototype.on = function(event, callback) {
            return this.each(function(el) {
                el.addEventListener(event, callback, false)
            })
        }

        // **TODO**: Add `mouseenter` event to non-IE browsers.
        J.prototype.mouseenter = function(callback) {
            return this.on('mouseover', callback)
        }

        // **TODO**: Add `mouseleave` event to non-IE browsers.
        J.prototype.mouseleave = function(callback) {
            return this.on('mouseout', callback)
        }

        J.prototype.click = function(callback) {
            return this.on('click', callback)
        }
    }())

    // #### DOM Manipulation
    ;(function() {
        J.prototype.append = function(elements) {
            return this.each(function(el) {
                elements.each(function(appendedElement) {
                    el.appendChild(appendedElement)
                })
            })
        }

        J.prototype.prepend = function(elements) {
            return this.each(function(el) {
                elements.each(function(appendedElement) {
                    el.insertBefore(appendedElement, el.firstChild)
                })
            })
        }

        J.prototype.remove = function() {
            return this.each(function(el) {
                el.parentNode.removeChild(el)
            })
        }
    }())

    // #### Attributes
    ;(function() {
        function _getAttribute(self, attribute) {
            return self.elements[0].getAttribute(attribute)
        }

        function _setAttribute(self, attribute, value) {
            return self.each(function(el) {
                el.setAttribute(attribute, value)
            })
        }

        J.prototype.attr = function(attribute, value) {
            return value == null ?
                _getAttribute(this, attribute) :
                _setAttribute(this, attribute, value)
        }

        J.prototype.removeAttr = function(attribute) {
            return this.each(function(el) {
                el.removeAttribute(attribute)
            })
        }
    }())

    // #### Classes
    ;(function() {
        J.prototype.addClass = function(className) {
            return this.each(function(el) {
                el.classList.add(className)
            })
        }

        J.prototype.removeClass = function(className) {
            return this.each(function(el) {
                el.classList.remove(className)
            })
        }

        J.prototype.toggleClass = function(className) {
            return this.each(function(el) {
                el.classList.toggle(className)
            })
        }
    }())

    // #### CSS properties
    ;(function() {
        var _makeVendorProperty = (function() {
            var _prefixes = ['Webkit', 'Moz', 'ms', 'O']

              , _style = document.createElement('div').style

            return function(property) {
                if (property in _style) return property

                var vendorProp, i

                property = property[0].toUpperCase() + property.substr(1)

                for (i = 0; i < _prefixes.length; i++) {
                    vendorProp = _prefixes[i] + property

                    if (vendorProp in _style) return vendorProp
                }
            }
        }())

        // Gets the value of the CSS property for the first element.
        function _getCSS(self, property) {
            var el = self.elements[0]

            return getComputedStyle(el).getPropertyValue(property)
        }

        // Sets the CSS property for every element to the given value.
        function _setCSS(self, property, value) {
            return self.each(function(el) {
                el.style[property] = value
            })
        }

        // Gets or sets the CSS property.
        J.prototype.css = function(property, value) {
            property = _makeVendorProperty(property)

            return value == null ?
                _getCSS(this, property) :
                _setCSS(this, property, value)
        }
    }())

    // #### Show/hide
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

    // #### Text and HTML
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

    // Returns a random RGB color in hex format (`#FF0A10`)
    J.randomColor = function() {
        var r = J.padLeft(J.random(255).toString(16), 2, '0')
          , g = J.padLeft(J.random(255).toString(16), 2, '0')
          , b = J.padLeft(J.random(255).toString(16), 2, '0')

        return ('#' + r + g + b).toUpperCase()
    }

    J.each = (function() {
        function _eachArray(object, callback) {
            var i

            for (i = 0; i < object.length; i++)
                callback.call(object, object[i], i)

            return object
        }

        function _eachObject(object, callback) {
            var prop

            for (prop in object)
                if (object.hasOwnProperty(prop))
                    callback.call(object, prop, object[prop])

            return object
        }

        return function(object, callback) {
            return object.length != null ?
                _eachArray(object, callback) :
                _eachObject(object, callback)
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
