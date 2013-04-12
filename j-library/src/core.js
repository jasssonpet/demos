/*!
 * J Library
 *
 * Copyright 2013 jasssonpet
 * Released under the MIT license
 */

// TODO: call this, instead of self for private methods

// # J library

// Everything inside is visible only in the module.
var J = (function() {
    'use strict';

    // ## Constructor

    var J = (function() {
        var _voidTag = /^<(\w+)\s?\/>$/ // <div />

        function _htmlElementConstructor(self, htmlElement) {
            self._elements = [htmlElement]

            return self
        }

        function _createHtmlElementConstructor(self, voidTag) {
            var tagName = voidTag.match(_voidTag)[1]

              , htmlElement = document.createElement(tagName)

            return _htmlElementConstructor(self, htmlElement)
        }

        function _selectorConstructor(self, selector, context) {
            var contextElements = context && context._elements || [document.documentElement]

            self._elements = []

            J.each(contextElements, function() {
                J.addRange(self._elements, this.querySelectorAll(selector))
            })

            return self
        }

        // The constructor accepts a string `J('p, div')` or a DOM Node `J(document.getElementById('id'))`.
        return function(selector, context) {
            if (!(this instanceof J))
                return new J(selector, context)

            if (selector instanceof HTMLElement)
                return _htmlElementConstructor(this, selector)

            if (_voidTag.test(selector))
                return _createHtmlElementConstructor(this, selector)

            return _selectorConstructor(this, selector, context)
        }
    }())

    // ## Prototype

    J.prototype.each = function(callback) {
        J.each(this._elements, callback)

        return this
    }

    // ### Events
    ;(function () {
        J.prototype.on = function(event, callback) {
            return this.each(function() {
                this.addEventListener(event, callback, false)
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

    // ### DOM Manipulation
    ;(function() {
        J.prototype.prepend = function(elements) {
            return this.each(function() {
                var el = this

                elements.each(function() {
                    el.insertBefore(this, el.firstChild)
                })
            })
        }

        J.prototype.append = function(elements) {
            return this.each(function() {
                var el = this

                elements.each(function() {
                    el.appendChild(this)
                })
            })
        }

        J.prototype.remove = function() {
            return this.each(function() {
                this.parentNode.removeChild(this)
            })
        }
    }())

    // ### Attributes
    ;(function() {
        function _getAttribute(self, attribute) {
            return self._elements[0].getAttribute(attribute)
        }

        function _setAttribute(self, attribute, value) {
            return self.each(function() {
                this.setAttribute(attribute, value)
            })
        }

        function _removeAttribute(self, attribute) {
            return self.each(function() {
                this.removeAttribute(attribute)
            })
        }

        J.prototype.attr = function(attribute, value) {
            return arguments.length === 1 ?
                _getAttribute(this, attribute) :
                _setAttribute(this, attribute, value)
        }

        J.prototype.removeAttr = function(attribute) {
            _removeAttribute(this, attribute)
        }
    }())

    // ### Data Attributes
    // TODO: HTML data-* attributes
    ;(function() {
        function _getData(self, key) {
            var el = self._elements[0]

            return el[key]
        }

        function _setData(self, key, value) {
            return self.each(function() {
                this[key] = value
            })
        }

        function _removeData(self, key) {
            return self.each(function() {
                this[key] = null
            })
        }

        J.prototype.data = function(key, value) {
            return arguments.length === 1 ?
                _getData(this, key) :
                _setData(this, key, value)
        }

        J.prototype.removeData = function(key) {
            return _removeData(this, key)
        }
    }())

    // ### Classes
    ;(function() {
        J.prototype.addClass = function(className) {
            return this.each(function() {
                this.classList.add(className)
            })
        }

        J.prototype.removeClass = function(className) {
            return this.each(function() {
                this.classList.remove(className)
            })
        }

        J.prototype.toggleClass = function(className) {
            return this.each(function() {
                this.classList.toggle(className)
            })
        }
    }())

    // ### CSS Properties
    ;(function() {
        var _makeVendorProperty = (function() {
            var _vendorPrefixes = ['Webkit', 'Moz', 'ms', 'O']

              , _style = document.createElement('div').style

            return function(property) {
                if (property in _style) return property

                var pascalCasedProperty = property[0].toUpperCase() + property.substr(1)
                  , vendorProperty

                J.each(function() {
                    vendorProperty = this + pascalCasedProperty

                    if (vendorProperty in _style)
                        return false
                })

                return vendorProperty
            }
        }())

        function _getCSS(self, property) {
            var el = self._elements[0]

            return getComputedStyle(el)[property]
        }

        function _setCSS(self, property, value) {
            return self.each(function() {
                this.style[property] = value
            })
        }

        // The property is in camelCase
        J.prototype.css = function(property, value) {
            property = _makeVendorProperty(property)

            return arguments.length === 1 ?
                _getCSS(this, property) :
                _setCSS(this, property, value)
        }
    }())

    // ### Show/hide
    ;(function() {
        // **TODO**: Restore the original display (`inline, table ...`).
        function _showHide(self, show) {
            return self.css('display', show ? 'block' : 'none')
        }

        J.prototype.show = function() {
           return _showHide(this, true)
        }

        J.prototype.hide = function() {
            return _showHide(this, false)
        }
    }())

    // ### Text
    ;(function() {
        function _getText(self) {
            var el = self._elements[0]

            return el.textContent
        }

        function _setText(self, text) {
            return self.each(function() {
                this.textContent = text
            })
        }

        J.prototype.text = function(text) {
            return arguments.length === 0 ?
                _getText(this) :
                _setText(this, text)
        }
    }())

    // ### HTML
    ;(function() {
        function _getHtml(self) {
            var el = self._elements[0]

            return el.innerHTML
        }

        function _setHtml(self, html) {
            return self.each(function() {
                this.innerHTML = html
            })
        }

        J.prototype.html = function(html) {
            return arguments.length === 0 ?
                _getHtml(this) :
                _setHtml(this, html)
        }
    }())

    // ### Static Methods

    J.repeat = function(string, times) {
        var result = ''

        while (times--) result += string

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


    // Works like `Array.protype.concat()` but doesn't create a new array.
    J.addRange = function(self, elements) {
        J.each(elements, function() {
            self.push(this)
        })

        return self
    }

    // Creates an array with values `[min, min + 1, ..., max - 1, max]` or `[0, ... min]`.
    J.range = function(min, max) {
        if (arguments.length === 1) return J.range(0, min)

        var result = new Array(max - min + 1)

        return J.each(result, function(i) {
            result[i] = min + i
        })
    }

    // Creates a random integer in the range `[min, max]` or `[0, min]`.
    J.random = function(min, max) {
        if (arguments.length === 1) return J.random(0, min)

        return min + Math.floor(Math.random() * (max - min + 1))
    }

    J.randomColor = function() {
        var r = J.padLeft(J.random(255).toString(16), 2, '0')
          , g = J.padLeft(J.random(255).toString(16), 2, '0')
          , b = J.padLeft(J.random(255).toString(16), 2, '0')

        return ('#' + r + g + b).toUpperCase()
    }

    ;(function() {
        function _isArrayLike(object) {
            return !!object.length
        }

        // TODO: break, continue and refactor internal for loops
        J.each = (function() {
            function _eachArray(object, callback) {
                var i

                for (i = 0; i < object.length; i++)
                    if (callback.call(object[i], i) === false)
                        break

                return object
            }

            function _eachObject(object, callback) {
                var i

                // hasOwnProperty?
                for (i in object)
                    if (callback.call(object[i], i) === false)
                        break

                return object
            }

            return function(object, callback) {
                return _isArrayLike(object) ?
                    _eachArray(object, callback) :
                    _eachObject(object, callback)
            }
        }())

        J.map = function(object, callback) {
            var result = _isArrayLike(object) ? [] : {}

            J.each(object, function(i) {
                result[i] = callback.call(this, i)
            })

            return result
        }

        J.filter = (function() {
            function _filterArray(object, callback) {
                var result = []

                J.each(object, function(i) {
                    if (callback.call(this, i))
                        result.push(this)
                })

                return result
            }

            function _filterObject(object, callback) {
                var result = {}

                J.each(object, function(i) {
                    if (callback.call(this, i))
                        result[i] = this
                })

                return result
            }

            return function(object, callback) {
                return _isArrayLike(object) ?
                    _filterArray(object, callback) :
                    _filterObject(object, callback)
            }
        }())
    }())

    J.now = function() {
        return +new Date()
    }

    // Exposes the constructor to the global scope.
    return J
}())
