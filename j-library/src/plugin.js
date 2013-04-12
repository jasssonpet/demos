/*global J */

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
