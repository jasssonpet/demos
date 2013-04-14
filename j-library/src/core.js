/*!
 * J Library - https://github.com/jasssonpet/demos/tree/gh-pages/j-library
 *
 * Copyright 2013 jasssonpet
 * Released under the MIT license
 */

/*jshint laxcomma: true, asi: true, curly: false, eqnull: true, bitwise: false */

// # J library

this.J = (function() {
    'use strict';

    // ## Constructor

    var J = (function() {
        var _voidTag = /^<(\w+) \/>$/

        function _defaultConstructor(self) {
            return self
        }

        function _htmlElementConstructor(self, htmlElement) {
            self._elements.push(htmlElement)

            return self
        }

        function _createHtmlElementConstructor(self, voidTag) {
            var tagName = voidTag.match(_voidTag)[1]

              , htmlElement = document.createElement(tagName)

            return _htmlElementConstructor(self, htmlElement)
        }

        function _selectorConstructor(self, selector, context) {
            var contextElements = context && context._elements || [document.documentElement]

            J.each(contextElements, function() {
                J.merge(self._elements, this.querySelectorAll(selector))
            })

            return self
        }

        return function(selector, context) {
            if (!(this instanceof J))
                return new J(selector, context)

            this._elements = []

            if (selector == null)
                return _defaultConstructor(this)

            if (selector instanceof HTMLElement)
                return _htmlElementConstructor(this, selector)

            if (_voidTag.test(selector))
                return _createHtmlElementConstructor(this, selector)

            return _selectorConstructor(this, selector, context)
        }
    }())

    // ## Static Methods

    // ### String Manipulation

    J.repeat = function(string, times) {
        var result = ''

        while (times --> 0)
            result += string

        return result
    }

    // #### PadLeft/PadRight
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

    // ### Array-like and Object Manipulation
    ;(function() {
        function _isArrayLike(object) {
            return !!object.length
        }

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

                for (i in object)
                    if (object.hasOwnProperty(i))
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

        // #### Filter/Reject & Any/All
        ;(function() {
            function _invertPredicate(callback) {
                return function() {
                    return !callback.apply(this, arguments)
                }
            }

            ;(function() {
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

                J.reject = function(object, callback) {
                    return J.filter(object, _invertPredicate(callback))
                }
            }())

            ;(function() {
                function _anyAll(object, callback, start) {
                    var result = start

                    J.each(object, function(i) {
                        if (callback.call(this, i)) {
                            result = !result

                            return false
                        }
                    })

                    return result
                }

                J.any  =
                J.some = function(object, callback) {
                    return _anyAll(object, callback, false)
                }

                J.all   =
                J.every = function(object, callback) {
                    return _anyAll(object, _invertPredicate(callback), true)
                }
            }())
        }())

        J.merge = (function() {
            function _mergeArray(object, elements) {
                J.each(elements, function() {
                    object.push(this)
                })

                return object
            }

            function _mergeObject(object, elements) {
                J.each(elements, function(prop) {
                    object[prop] = this
                })

                return object
            }

            return function(object, elements) {
                return _isArrayLike(object) ?
                    _mergeArray(object, elements) :
                    _mergeObject(object, elements)
            }
        }())
    }())

    // ### Array Manipulation

    J.shuffle = (function() {
        function _swap(array, i, j) {
            array[i] = [array[j], array[j] = array[i]][0]
        }

        return function(array) {
            var i

            for (i = array.length - 1; i > 0; i--)
                _swap(array, i, J.random(i))

            return array
        }
    }())

    J.contains = function(array, element) {
        return array.indexOf(element) !== -1
    }

    J.binarySearch = function(array, element) {
        var left = 0
          , middle
          , right = array.length - 1

        while (left <= right) {
            middle = left + ((right - left) >>> 1)

            if (array[middle] < element)
                left = middle + 1

            else if (array[middle] > element)
                right = middle - 1

            else return middle
        }

        return -1
    }

    J.uniq = function(array) {
        var result = []

        J.each(array, function() {
            if (!J.contains(result, this))
                result.push(this)
        })

        return result
    }

    J.range = function(min, maxInclusive) {
        if (arguments.length === 1) return J.range(0, min)

        var result = new Array(maxInclusive - min + 1)

        return J.each(result, function(i) {
            result[i] = min + i
        })
    }

    // ### Random Generators

    J.random = function(min, maxInclusive) {
        if (arguments.length === 1) return J.random(0, min)

        var possibleNumbers = maxInclusive - min + 1

        return min + Math.floor(Math.random() * possibleNumbers)
    }

    J.randomByte = function() {
        var decimal = J.random(1 << 8)

        return J.padLeft(decimal.toString(16), 2, '0').toUpperCase()
    }

    J.randomColor = function() {
        var r = J.randomByte()
          , g = J.randomByte()
          , b = J.randomByte()

        return ('#' + r + g + b)
    }

    // ### Utilities

    J.now = function() {
        return +new Date()
    }

    // ## Prototype

    // ### Elements higher-order functions
    ;(function() {
        J.prototype.each = function(callback) {
            J.each(this._elements, callback)

            return this
        }

        J.prototype.map = function(callback) {
            return J.map(this._elements, callback)
        }

        J.prototype.filter = function(callback) {
            var result = new J()

            result._elements = J.filter(this._elements, callback)

            return result
        }

        J.prototype.reject = function(object, callback) {
            return J.reject(this._elements, callback)
        }

        J.prototype.any  =
        J.prototype.some = function(callback) {
            return J.some(this._elements, callback)
        }

        J.prototype.all   =
        J.prototype.every = function(callback) {
            return J.all(this._elements, callback)
        }
    }())

    // ### Elements manipulation
    ;(function() {
        J.prototype.get = function(index) {
            return index == null ?
                this._elements :
                this._elements[index]
        }

        J.prototype.size = function() {
            return this._elements.length
        }
    }())

    // ### Events
    ;(function() {
        J.prototype.on = function(event, callback) {
            return this.each(function() {
                this.addEventListener(event, callback)
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
                var parentElement = this

                elements.each(function() {
                    parentElement.insertBefore(this, parentElement.firstChild)
                })
            })
        }

        J.prototype.append = function(elements) {
            return this.each(function() {
                var parentElement = this

                elements.each(function() {
                    parentElement.appendChild(this)
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
            var firstElement = self._elements[0]

            return firstElement.getAttribute(attribute)
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

    // ### Data
    ;(function() {
        function _hasDataProperty(element, key) {
            return element._data && (key in element._data)
        }

        function _getDataProperty(element, key) {
            return element._data[key]
        }

        function _setDataProperty(element, key, value) {
            element._data = element._data || {}

            element._data[key] = value
        }

        function _parseDataAttribute(element, key) {
            var valueString = element.dataset[key]

            if (!(key in element.dataset))
                return undefined

            if (parseFloat(valueString).toString() === valueString)
                return parseFloat(valueString)

            if (valueString === 'null')
                return null

            if (valueString === 'true')
                return true

            if (valueString === 'false')
                return false

            try {
                return JSON.parse(valueString)

            } catch (e) {
                return valueString
            }
        }

        function _getData(self, key) {
            var firstElement = self._elements[0]

            return _hasDataProperty(firstElement, key) ?
                _getDataProperty(firstElement, key) :
                _parseDataAttribute(firstElement, key)
        }

        function _setData(self, key, value) {
            return self.each(function() {
                _setDataProperty(this, key, value)
            })
        }

        J.prototype.data = function(key, value) {
            return arguments.length === 1 ?
                _getData(this, key) :
                _setData(this, key, value)
        }

        J.prototype.removeData = function(key) {
            return this.data(key, undefined)
        }
    }())

    // ### Classes
    ;(function() {
        J.prototype.hasClass = function(className) {
            return this.any(function() {
                return this.classList.contains(className)
            })
        }

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

            return function(camelCasedProperty) {
                if (camelCasedProperty in _style) return camelCasedProperty

                var pascalCasedProperty = camelCasedProperty[0].toUpperCase() + camelCasedProperty.substr(1)
                  , vendorProperty

                J.each(_vendorPrefixes, function() {
                    vendorProperty = this + pascalCasedProperty

                    if (vendorProperty in _style)
                        return false
                })

                return vendorProperty
            }
        }())

        function _getCss(self, property) {
            var firstElement = self._elements[0]

            return getComputedStyle(firstElement)[property]
        }

        function _setCss(self, property, value) {
            return self.each(function() {
                this.style[property] = value
            })
        }

        J.prototype.css = function(camelCasedProperty, value) {
            var property = _makeVendorProperty(camelCasedProperty)

            return arguments.length === 1 ?
                _getCss(this, property) :
                _setCss(this, property, value)
        }
    }())

    // ### Show/hide
    ;(function() {
        function _isHidden(self) {
            return self.css('display') === 'none'
        }

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

        J.prototype.toggle = function() {
            return this.each(function() {
                var self = new J(this)

                _showHide(self, _isHidden(self))
            })
        }
    }())

    // ### Text
    ;(function() {
        function _getText(self) {
            var firstElement = self._elements[0]

            return firstElement.textContent
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
            var firstElement = self._elements[0]

            return firstElement.innerHTML
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

    // // J('p').log().log().delay(1000).log().log().delay(1000).log().log()

    // // This should be the last section.
    // ;(function() {
    //     function _tryDequeue(self) {
    //         var queue = self._delayQueue

    //         if (!queue.inProgress && queue.length)
    //             return queue.shift()()
    //     }

    //     J.prototype.log = function() {
    //         console.log(~~(J.now() / 1000) % 100)

    //         return this
    //     }

    //     J.prototype.delay = function(time) {
    //         var self = this

    //         this._delayQueue.inProgress = true

    //         setTimeout(function() {
    //             self._delayQueue.inProgress = false

    //             return _tryDequeue(self)
    //         }, time)

    //         return this
    //     }

    //     // This should be the last method
    //     J.prototype = J.map(J.prototype, function(/* methodName */) {
    //         var methodBody = this

    //         return function() {
    //             var self = this
    //               , methodArguments = arguments

    //             this._delayQueue.push(function() {
    //                 methodBody.apply(self, methodArguments)

    //                 return _tryDequeue(self)
    //             })

    //             _tryDequeue(this)

    //             return this
    //         }
    //     })
    // }())

    // return function() {
    //     var result = J.apply(this, arguments)

    //     result._delayQueue = []

    //     return result
    // }

    return J
}())
