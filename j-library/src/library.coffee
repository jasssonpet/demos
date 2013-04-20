#!
# J Library - https://github.com/jasssonpet/demos/tree/gh-pages/j-library
#
# Inspired by:
# - jQuery JavaScript Library - http://jquery.com/
# - Underscore.js - http://underscorejs.org/
#
# Copyright 2013 jasssonpet
# Released under the MIT license
#

'use strict'

# # J library
J = do ->

    # ## Constructor
    J = do ->
        voidTag =
            ///^
                <     # Opening bracket
                (\w+) # Tag name
                \s?   # Space
                />    # Closing bracket
            $///

        createHtmlElementConstructor = (voidTag) ->
            tagName = voidTag.match(voidTag)[1]

            htmlElement = document.createElement(tagName)

            htmlElementConstructor.call(this, htmlElement)

        htmlElementConstructor = (htmlElement) ->
            arrayOfObjectsConstructor.call(this, [htmlElement])

        arrayOfObjectsConstructor = (objects) ->
            J.merge(this, objects)

        selectorConstructor = (selector, context = [document]) ->
            J.each context, =>
                arrayOfObjectsConstructor.call this, @querySelectorAll(selector)

        return (selector, context) ->
            return new J(selector, context) unless this instanceof J

            @length = 0

            switch selector
                when not selector?
                    this

                when voidTag.test(selector)
                    createHtmlElementConstructor.call this, selector

                when selector instanceof HTMLElement
                    htmlElementConstructor.call this, selector

                when Array.isArray(selector)
                    arrayOfObjectsConstructor.call this, selector

                else selectorConstructor.call this, selector, context

    # ## Static Methods

    # ### String Manipulation

    J.repeat = (string, times) ->
        result = ''

        for i in [0 .. times]
            result += string

        result

    # #### PadLeft/PadRight
    do ->
        makeMissing = (string, length, character = ' ') ->
            J.repeat character, length - string.length

        J.padLeft = (string, length, character) ->
            makeMissing(string, length, character) + string

        J.padRight = (string, length, character) ->
            string + makeMissing(string, length, character)

    # ### Array-like and Object Manipulation
    do ->
        isArrayLike = ->
            'length' of this

        initialize = ->
            if isArrayLike.call(this) then [] else {}

        # TODO: Check only once and not on each iteration
        insert = (property, value) ->
            if isArrayLike.call(this) then @push(value) else this[property] = value

        J.each = do ->
            eachArray = (callback) ->
                for i in [0 .. @length]
                    if callback.call(this[i], i) is false
                        break

                return this

            eachObject = (callback) ->
                for own i of this
                    if callback.call(this[i], i) is false
                        break

                return this

            (object, callback) ->
                (if isArrayLike.call(object) then eachArray else eachObject).call(object, callback)

        J.map =
        J.select = (object, callback) ->
            result = initialize.call(object)

            J.each object, (i) ->
                mapped = callback.call(this, i)

                insert.call(result, i, mapped)

            result

        # #### Filter/Reject & Any/All
        do ->
            invertPredicate = (callback) ->
                -> not callback.apply(this, arguments)

            J.filter =
            J.where = (object, callback) ->
                result = initialize.call(object)

                J.each object, (i) ->
                    if callback.call(this, i)
                        insert.call result, i, this

                result

            J.reject = (object, callback) ->
                J.filter object, invertPredicate(callback)

            J.any =
            J.some = (object, callback) ->
                result = false

                J.each object, (i) ->
                    if callback.call(this, i)
                        result = true

                        return false

                result

            J.all =
            J.every = (object, callback) ->
                not J.any(object, invertPredicate(callback))

        J.uniq = (object) ->
            result = initialize.call(object)

            J.each object, (i) ->
                unless J.contains(result, this)
                    insert.call result, i, this

            result

        J.merge = (object, elements) ->
            J.each elements, (i) ->
                insert.call object, i, this

            object

    J.contains = (object, element) ->
        J.any object, ->
            this is element

    J.pluck = (object, property) ->
        J.map object, ->
            this[property]

    do ->
        minMax = (callback) ->
            result = callback()

            J.each this, ->
                result = callback(this, result)

            result

        J.min = (object) ->
            minMax.call object, Math.min

        J.max = (object) ->
            minMax.call object, Math.max

    # ### Array Manipulation

    J.shuffle = do ->
        swap = (array, i, j) ->
            [array[i], array[j]] = [array[j], array[i]]

        (array) ->
            for i in [array.length - 1 ... 0]
                swap array, i, J.random(i)

            return array

    J.binarySearch = (array, element) ->
        left = 0
        middle
        right = array.length - 1

        while left <= right
            middle = left + ((right - left) >>> 1)

            switch
                when array[middle] < element
                    left = middle + 1

                when array[middle] > element
                    right = middle - 1

                else return middle

        return -1

    J.toArray = (object) ->
        J.map object, -> @

    J.range = (min, maxInclusive) ->
        return J.range(0, min) if arguments.length is 1

        result = []

        for i in [min ... maxInclusive]
            result.push i

    # ### Random Generators

    J.random = (min, maxInclusive) ->
        return J.random(0, min) if arguments.length is 1

        possibleNumbers = maxInclusive - min + 1

        return min + Math.floor(Math.random() * possibleNumbers)

    J.randomByte = ->
        decimal = J.random(1 << 8)

        return J.padLeft(decimal.toString(16), 2, '0').toUpperCase()

    J.randomColor = ->
        r = J.randomByte()
        g = J.randomByte()
        b = J.randomByte()

        return "#" + r + g + b

    # ### AJAX

    J.get = (url, callback) ->
        request = new XMLHttpRequest

        request.onreadystatechange = ->
            if request.readyState is 4
                if request.status is 200
                    callback.call request, request.responseText

                # **TODO**: else

        request.open 'GET', url
        request.send()

    # ### Utilities

    J.now = ->
        +new Date

    # ### Elements manipulation
    J::push = (element) ->
        @[@length++] = element

    J::get = (index) ->
        if arguments.length is 0 then J.toArray(@) else @[index]

    J::size = ->
        @length

    # ## Prototype

    # ### Elements higher-order functions
    # Example: J.prototype.filter(callback) = J.filter(this, callback)
    do ->
        extendProto = (methodNames, resultFunction) ->
            J.each methodNames, ->
                methodName = this

                J::[methodName] = ->
                    methodArguments = J.merge([this], arguments)

                    returnedValue = J[methodName].apply(this, methodArguments)

                    resultFunction.call this, returnedValue

        do ->
            methodNames = ['each', 'map', 'select', 'any', 'some', 'all', 'every']

            extendProto methodNames, (returnedValue) ->
                returnedValue

        do ->
            methodNames = ['filter', 'where', 'reject']

            extendProto methodNames, (returnedValue) ->
                new J(returnedValue)

    # ### Events
    do ->
        events = [
            'blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll', 'unload', 'click', 'dblclick',
            'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'change', 'select', 'submit', 'keydown',
            'keypress', 'keyup', 'error', 'contextmenu'
        ]

        J.each events, ->
            J::[this] = =>
                methodArguments = J.merge([this], arguments)

                J.on methodArguments

    J::on = (event, callback) ->
        @each ->
            @addEventListener event, callback

    # **TODO**: Add `mouseenter` event to non-IE browsers.

    J::mouseenter = (callback) ->
        @on 'mouseover', callback

    # **TODO**: Add `mouseleave` event to non-IE browsers.

    J::mouseleave = (callback) ->
        @on 'mouseout', callback

    # ### DOM Manipulation
    # Example: body.append(div) = div.appendTo(body)
    do ->
        pairedMethods =
            prepend: 'prependTo'
            append: 'appendTo'
            before: 'insertBefore'
            after: 'insertAfter'

        J.each pairedMethods, (implementedMethod) ->
            J::[this] = (elements) ->
                elements[implementedMethod] this

                return this

    do ->
        eachEach = (elements, callback) ->
            @each ->
                parentElement = this

                elements.each ->
                    callback.call parentElement, this # Chrome bug: .cloneNode(true)


        J::prepend = (elements) ->
            eachEach.call this, elements, (newElement) ->
                @insertBefore newElement, @firstChild

        J::append = (elements) ->
            eachEach.call this, elements, (newElement) ->
                @appendChild newElement

        J::before = (elements) ->
            eachEach.call this, elements, (newElement) ->
                @parentNode.insertBefore newElement, this

        J::after = (elements) ->
            eachEach.call this, elements, (newElement) ->
                @parentNode.insertBefore newElement, @nextElementSibling

    do ->
        filteredMap = (callback) ->
            result = J.map this, ->
                callback.call this

            J.reject result, ->
                this is null

        J::prev = ->
            result = filteredMap.call this, ->
                @previousElementSibling

            new J(result)

        J::next = ->
            result = filteredMap.call this, ->
                @nextElementSibling

            new J(result)

        J::parent = ->
            result = filteredMap.call this, ->
                @parentNode

            result = J.uniq result

            new J(result)

        J::children = ->
            result = []

            J.each this, ->
                J.merge result, @children

            new J(result)

    J::remove = ->
        @each ->
            @parentNode.removeChild this

    # ### Attributes
    getAttribute = (attribute) ->
        firstElement = this[0]
        firstElement.getAttribute attribute

    setAttribute = (attribute, value) ->
        @each ->
            @setAttribute attribute, value

    removeAttribute = (attribute) ->
        @each ->
            @removeAttribute attribute

    J::attr = (attribute, value) ->
        (if arguments.length is 1 then getAttribute.call(this, attribute) else setAttribute.call(this, attribute, value))

    J::removeAttr = (attribute) ->
        removeAttribute.call this, attribute

    # ### Data
    do ->
        parseDataAttribute = (key) ->
            valueString = @dataset[key]
            return `undefined`  unless key of @dataset
            return parseFloat(valueString)  if parseFloat(valueString).toString() is valueString
            return true  if valueString is 'true'
            return false  if valueString is 'false'
            return null  if valueString is 'null'
            try
                return JSON.parse(valueString)
            catch e
                return valueString

        hasDataProperty = (key) ->
            @data and (key of @data)

        getDataProperty = (key) ->
            @data[key]

        setDataProperty = (key, value) ->
            @data = @data or {}
            @data[key] = value

        getData = (key) ->
            firstElement = this[0]
            (if hasDataProperty.call(firstElement, key) then getDataProperty.call(firstElement, key) else parseDataAttribute.call(firstElement, key))

        setData = (key, value) ->
            @each ->
                setDataProperty.call this, key, value

        J::data = (key, value) ->
            (if arguments.length is 1 then getData.call(this, key) else setData.call(this, key, value))

        J::removeData = (key) ->
            J::data.call this, key, `undefined`

    # ### Classes
    J::hasClass = (className) ->
        @any ->
            @classList.contains className

    J::addClass = (className) ->
        @each ->
            @classList.add className

    J::removeClass = (className) ->
        @each ->
            @classList.remove className

    J::toggleClass = (className) ->
        @each ->
            @classList.toggle className

    # ### CSS Properties
    do ->
        makeVendorProperty = do ->
            vendorPrefixes = ['Webkit', 'Moz', 'ms', 'O']

            style = document.createElement('div').style

            (camelCasedProperty) ->
                return camelCasedProperty if camelCasedProperty of style

                pascalCasedProperty = camelCasedProperty[0].toUpperCase() + camelCasedProperty.substr(1)

                vendorProperty

                J.each vendorPrefixes, ->
                    vendorProperty = this + pascalCasedProperty

                    return false if vendorProperty of style

                    vendorProperty = undefined

                return vendorProperty

        getCss = (property) ->
            firstElement = this[0]

            return getComputedStyle(firstElement)[property]

        setCss = (property, value) ->
            @each ->
                @style[property] = value

        J::css = (camelCasedProperty, value) ->
            property = makeVendorProperty(camelCasedProperty)

            (if arguments.length is 1 then getCss else setCss).call(this, property, value)

    # ### Show/hide
    do ->
        isHidden = ->
            @css('display') is 'none'

        # **TODO**: Restore the original display (`inline, table ...`).
        showHide = (show) ->
            @css('display', (if show then 'block' else 'none'))

        J::show = ->
            showHide.call(this, true)

        J::hide = ->
            showHide.call(this, false)

        J::toggle = ->
            @each ->
                self = new J(this)

                showHide.call self, isHidden.call(self)

    # ### Text
    do ->
        getText = ->
            firstElement = this[0]

            return firstElement.textContent

        setText = (text) ->
            @each ->
                @textContent = text

        J::text = (text) ->
            (if arguments.length is 0 then getText else setText).call(this, text)

    # ### HTML
    do ->
        getHtml = ->
            firstElement = this[0]

            return firstElement.innerHTML

        setHtml = (html) ->
            @each ->
                @innerHTML = html

        J::html = (html) ->
            (if arguments.length is 0 then getHtml else setHtml).call(this, html)

    # TODO: Deffered

    # // J('p').log().log().delay(1000).log().log().delay(1000).log().log()

    # // This should be the last section.
    # ;(function() {
    #     function tryDequeue() {
    #         var queue = this.delayQueue

    #         if (!queue.inProgress && queue.length)
    #             return queue.shift()()
    #     }

    #     J.prototype.log = function() {
    #         console.log(~~(J.now() / 1000) % 100)

    #         return this
    #     }

    #     J.prototype.delay = function(time) {
    #         var self = this

    #         this.delayQueue.inProgress = true

    #         setTimeout(function() {
    #             self.delayQueue.inProgress = false

    #             return tryDequeue.call(self)
    #         }, time)

    #         return this
    #     }

    #     // This should be the last method
    #     J.prototype = J.map(J.prototype, function(methodName) {
    #         var methodBody = this

    #         if (methodName === 'push')
    #             return this

    #         return function() {
    #             var self = this
    #               , methodArguments = arguments

    #             // console.log(this.delayQueue)

    #             this.delayQueue.push(function() {
    #                 methodBody.apply(self, methodArguments)

    #                 return tryDequeue.call(self)
    #             })

    #             tryDequeue.call(this)

    #             return this
    #         }
    #     })
    # }())

    # return function() {
    #     var result = J.apply(this, arguments)

    #     console.log(result)

    #     result.delayQueue = []

    #     return result
    # }

    J
