/*!
 * J Library - https://github.com/jasssonpet/demos/tree/gh-pages/j-library
 *
 * Copyright 2013 jasssonpet
 * Released under the MIT license
 */

/*jshint laxcomma: true, asi: true, curly: false, eqnull: true, bitwise: false */

// # J library

this.J = (function() {
    /*jshint validthis: true */

    'use strict';

    // ## Constructor

    var J = (function() {
        var _voidTag = /^<(\w+) \/>$/

        function _defaultConstructor() {
            void 0
        }

        function _htmlElementConstructor(htmlElement) {
            this.push(htmlElement)
        }

        function _createHtmlElementConstructor(voidTag) {
            var tagName = voidTag.match(_voidTag)[1]

              , htmlElement = document.createElement(tagName)

            _htmlElementConstructor.call(this, htmlElement)
        }

        function _arrayOfObjectsConstructor(objects) {
            J.merge(this, objects)
        }

        function _selectorConstructor(selector, context) {
            var self = this

            context = context || [document.documentElement]

            J.each(context, function() {
                _arrayOfObjectsConstructor.call(self, this.querySelectorAll(selector))
            })
        }

        return function(selector, context) {
            if (!(this instanceof J))
                return new J(selector, context)

            this.length = 0

            if (selector == null)
                _defaultConstructor.call(this)

            else if (selector instanceof HTMLElement)
                _htmlElementConstructor.call(this, selector)

            else if (_voidTag.test(selector))
                _createHtmlElementConstructor.call(this, selector)

            else if (Array.isArray(selector))
                _arrayOfObjectsConstructor.call(this, selector)

            else _selectorConstructor.call(this, selector, context)
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
        function _makeMissing(length, character) {
            return J.repeat(character || ' ', length - this.length)
        }

        J.padLeft = function(string, length, character) {
            return _makeMissing.call(string, length, character) + string
        }

        J.padRight = function(string, length, character) {
            return string + _makeMissing.call(string, length, character)
        }
    }())

    // ### Array-like and Object Manipulation
    ;(function() {
        function _isArrayLike() {
            return this.length >= 0
        }

        J.each = (function() {
            function _eachArray(callback) {
                var i

                for (i = 0; i < this.length; i++)
                    if (callback.call(this[i], i) === false)
                        break

                return this
            }

            function _eachObject(callback) {
                var i

                for (i in this)
                    if (this.hasOwnProperty(i))
                        if (callback.call(this[i], i) === false)
                            break

                return this
            }

            return function(object, callback) {
                return _isArrayLike.call(object) ?
                    _eachArray.call(object, callback) :
                    _eachObject.call(object, callback)
            }
        }())

        J.map =
        J.select = function(object, callback) {
            var result = _isArrayLike.call(object) ? [] : {}

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
                J.filter =
                J.where = (function() {
                    function _filterArray(callback) {
                        var result = []

                        J.each(this, function(i) {
                            if (callback.call(this, i))
                                result.push(this)
                        })

                        return result
                    }

                    function _filterObject(callback) {
                        var result = {}

                        J.each(this, function(i) {
                            if (callback.call(this, i))
                                result[i] = this
                        })

                        return result
                    }

                    return function(object, callback) {
                        return _isArrayLike.call(object) ?
                            _filterArray.call(object, callback) :
                            _filterObject.call(object, callback)
                    }
                }())

                J.reject = function(object, callback) {
                    return J.filter(object, _invertPredicate(callback))
                }
            }())

            ;(function() {
                J.any =
                J.some = function(object, callback) {
                    var result = false

                    J.each(object, function(i) {
                        if (callback.call(this, i)) {
                            result = true

                            return false
                        }
                    })

                    return result
                }

                J.all =
                J.every = function(object, callback) {
                    return !J.any(object, _invertPredicate(callback))
                }
            }())
        }())

        J.contains = function(object, element) {
            return J.any(object, function() {
                return this === element
            })
        }

        J.pluck = function(object, property) {
            return J.map(object, function() {
                return this[property]
            })
        }

        ;(function() {
            function _minMax(callback) {
                var result = callback()

                J.each(this, function() {
                    result = callback(this, result)
                })

                return result
            }

            J.min = function(object) {
                return _minMax.call(object, Math.min)
            }

            J.max = function(object) {
                return _minMax.call(object, Math.max)
            }
        }())

        J.merge = (function() {
            function _mergeArray(elements) {
                var self = this

                J.each(elements, function() {
                    self.push(this)
                })

                return this
            }

            function _mergeObject(elements) {
                var self = this

                J.each(elements, function(prop) {
                    self[prop] = this
                })

                return this
            }

            return function(object, elements) {
                return _isArrayLike.call(object) ?
                    _mergeArray.call(object, elements) :
                    _mergeObject.call(object, elements)
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

    J.toArray = function(object) {
        return J.map(object, function() {
            return this
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

    // ### Elements manipulation
    ;(function() {
        J.prototype.push = function(element) {
            this[this.length++] = element

            return element
        }

        J.prototype.get = function(index) {
            return arguments.length === 0 ?
                J.toArray(this) :
                this[index]
        }

        J.prototype.size = function() {
            return this.length
        }
    }())

    // ## Prototype

    // ### Elements higher-order functions
    // Example: J.prototype.filter(callback) = J.filter(this, callback)
    ;(function() {
        function _extendProto(methodNames, resultFunction) {
            J.each(methodNames, function() {
                var methodName = this

                J.prototype[methodName] = function() {
                    var methodArguments = J.merge([this], arguments)

                      , returnedValue = J[methodName].apply(this, methodArguments)

                    return resultFunction.call(this, returnedValue)
                }
            })
        }

        ;(function() {
            var methodNames = ['each']

            _extendProto(methodNames, function() {
                return this
            })
        }())

        ;(function() {
            var methodNames = ['filter', 'where', 'reject']

            _extendProto(methodNames, function(returnedValue) {
                return new J(returnedValue)
            })
        }())

        ;(function() {
            var methodNames = ['map', 'select', 'any', 'some', 'all', 'every']

            _extendProto(methodNames, function(returnedValue) {
                return returnedValue
            })
        }())
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
        ;(function() {
            var pairedMethods =
                { 'prepend': 'prependTo'
                , 'append' : 'appendTo'

                , 'before': 'insertBefore'
                , 'after' : 'insertAfter'
            }

            J.each(pairedMethods, function(implementedMethod) {
                J.prototype[this] = function(elements) {
                    elements[implementedMethod](this)

                    return this
                }
            })
        }())

        ;(function() {
            function _eachEach(elements, callback) {
                return this.each(function() {
                    var parentElement = this

                    elements.each(function() {
                        callback.call(parentElement, this.cloneNode(true))
                    })
                })
            }

            J.prototype.prepend = function(elements) {
                return _eachEach.call(this, elements, function(newElement) {
                    this.insertBefore(newElement, this.firstChild)
                })
            }

            J.prototype.append = function(elements) {
                return _eachEach.call(this, elements, function(newElement) {
                    this.appendChild(newElement)
                })
            }

            J.prototype.before = function(elements) {
                return _eachEach.call(this, elements, function(newElement) {
                    this.parentNode.insertBefore(newElement, this)
                })
            }

            J.prototype.after = function(elements) {
                return _eachEach.call(this, elements, function(newElement) {
                    this.parentNode.insertBefore(newElement, this.nextElementSibling)
                })
            }
        }())

        ;(function() {
            function _filteredMap(callback) {
                var result = J.map(this, function() {
                    return callback.call(this)
                })

                result = J.reject(result, function() {
                    return this === null
                })

                return new J(result)
            }

            J.prototype.prev = function() {
                return _filteredMap.call(this, function() {
                    return this.previousElementSibling
                })
            }

            J.prototype.next = function() {
                return _filteredMap.call(this, function() {
                    return this.nextElementSibling
                })
            }

            J.prototype.parent = function() {
                return _filteredMap.call(this, function() {
                    return this.parentNode
                })
            }
        }())

        J.prototype.remove = function() {
            return this.each(function() {
                this.parentNode.removeChild(this)
            })
        }
    }())

    // ### Attributes
    ;(function() {
        function _getAttribute(attribute) {
            var firstElement = this[0]

            return firstElement.getAttribute(attribute)
        }

        function _setAttribute(attribute, value) {
            return this.each(function() {
                this.setAttribute(attribute, value)
            })
        }

        function _removeAttribute(attribute) {
            return this.each(function() {
                this.removeAttribute(attribute)
            })
        }

        J.prototype.attr = function(attribute, value) {
            return arguments.length === 1 ?
                _getAttribute.call(this, attribute) :
                _setAttribute.call(this, attribute, value)
        }

        J.prototype.removeAttr = function(attribute) {
            _removeAttribute.call(this, attribute)
        }
    }())

    // ### Data
    ;(function() {
        function _hasDataProperty(key) {
            return this._data && (key in this._data)
        }

        function _getDataProperty(key) {
            return this._data[key]
        }

        function _setDataProperty(key, value) {
            this._data = this._data || {}

            this._data[key] = value
        }

        function _parseDataAttribute(key) {
            var valueString = this.dataset[key]

            if (!(key in this.dataset))
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

        function _getData(key) {
            var firstElement = this[0]

            return _hasDataProperty.call(firstElement, key) ?
                _getDataProperty.call(firstElement, key) :
                _parseDataAttribute.call(firstElement, key)
        }

        function _setData(key, value) {
            return this.each(function() {
                _setDataProperty.call(this, key, value)
            })
        }

        J.prototype.data = function(key, value) {
            return arguments.length === 1 ?
                _getData.call(this, key) :
                _setData.call(this, key, value)
        }

        J.prototype.removeData = function(key) {
            return J.prototype.data.call(this, key, undefined)
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

                    vendorProperty = undefined
                })

                return vendorProperty
            }
        }())

        function _getCss(property) {
            var firstElement = this[0]

            return getComputedStyle(firstElement)[property]
        }

        function _setCss(property, value) {
            return this.each(function() {
                this.style[property] = value
            })
        }

        J.prototype.css = function(camelCasedProperty, value) {
            var property = _makeVendorProperty(camelCasedProperty)

            return arguments.length === 1 ?
                _getCss.call(this, property) :
                _setCss.call(this, property, value)
        }
    }())

    // ### Show/hide
    ;(function() {
        function _isHidden() {
            return this.css('display') === 'none'
        }

        // **TODO**: Restore the original display (`inline, table ...`).
        function _showHide(show) {
            return this.css('display', show ? 'block' : 'none')
        }

        J.prototype.show = function() {
           return _showHide.call(this, true)
        }

        J.prototype.hide = function() {
            return _showHide.call(this, false)
        }

        J.prototype.toggle = function() {
            return this.each(function() {
                var self = new J(this)

                _showHide.call(self, _isHidden.call(self))
            })
        }
    }())

    // ### Text
    ;(function() {
        function _getText() {
            var firstElement = this[0]

            return firstElement.textContent
        }

        function _setText(text) {
            return this.each(function() {
                this.textContent = text
            })
        }

        J.prototype.text = function(text) {
            return arguments.length === 0 ?
                _getText.call(this) :
                _setText.call(this, text)
        }
    }())

    // ### HTML
    ;(function() {
        function _getHtml() {
            var firstElement = this[0]

            return firstElement.innerHTML
        }

        function _setHtml(html) {
            return this.each(function() {
                this.innerHTML = html
            })
        }

        J.prototype.html = function(html) {
            return arguments.length === 0 ?
                _getHtml.call(this) :
                _setHtml.call(this, html)
        }
    }())

    // // J('p').log().log().delay(1000).log().log().delay(1000).log().log()

    // // This should be the last section.
    // ;(function() {
    //     function _tryDequeue() {
    //         var queue = this._delayQueue

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

    //             return _tryDequeue.call(self)
    //         }, time)

    //         return this
    //     }

    //     // This should be the last method
    //     J.prototype = J.map(J.prototype, function(methodName) {
    //         var methodBody = this

    //         if (methodName === 'push')
    //             return this

    //         return function() {
    //             var self = this
    //               , methodArguments = arguments

    //             // console.log(this._delayQueue)

    //             this._delayQueue.push(function() {
    //                 methodBody.apply(self, methodArguments)

    //                 return _tryDequeue.call(self)
    //             })

    //             _tryDequeue.call(this)

    //             return this
    //         }
    //     })
    // }())

    // return function() {
    //     var result = J.apply(this, arguments)

    //     console.log(result)

    //     result._delayQueue = []

    //     return result
    // }

    return J
}())
