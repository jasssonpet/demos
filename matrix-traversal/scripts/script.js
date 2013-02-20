/*global angular */

;(function() {
'use strict';

var APP = angular.module('app', [])

  , speed = 1000 / 3 // Timeout delay

  , field =
        [ [1, 3, 2, 2, 2, 4]
        , [3, 3, 3, 2, 4, 4]
        , [4, 3, 1, 2, 3, 3]
        , [4, 3, 1, 3, 3, 1]
        , [4, 3, 3, 3, 1, 1]
    ]

APP.controller('ctrl', function($scope, $timeout, $q, $log) {
    $scope.type = "DFS"

    $scope.currentLength = 0

    $scope.isAnimating = false

    $scope.matrix = field.map(function(row) {
        return row.map(function(cell) {
            return { value: cell, visited: false }
        })
    })

    $scope.traverse = (function() {
        var directions = [ [1, 0], [0, 1], [-1, 0], [0, -1] ]

          , list = []

          , deffered = null

        function animate() {
            if ($scope.isAnimating)
                throw new Error("Animation in progress!")

            $scope.isAnimating = true

            deffered = $q.defer()

            deffered.promise.then(function() {
                $scope.isAnimating = false
            })
        }

        function reset() {
            $scope.currentLength = 0

            $scope.matrix.forEach(function(row) {
                row.forEach(function(cell) {
                    cell.visited = false
                })
            })
        }

        function isInside(row, col) {
            return 0 <= row && row < $scope.matrix.length &&
                   0 <= col && col < $scope.matrix[row].length
        }

        function isNext(row, col, value) {
            if (!isInside(row, col))
                return false

            if ($scope.matrix[row][col].visited)
                return false

            if ($scope.matrix[row][col].value != value)
                return false

            return true
        }

        function visit(row, col) {
            $log.log(row, col)

            $scope.currentLength++

            $scope.matrix[row][col].visited = true
        }

        // Recursive loop with timeout
        function loop() {
            var current = list[{ 'DFS': 'pop', 'BFS': 'shift' }[$scope.type]]()

              , value = $scope.matrix[current[0]][current[1]].value

            visit(current[0], current[1])

            directions.forEach(function(direction) {
                var nextRow = current[0] + direction[0]
                  , nextCol = current[1] + direction[1]

                if (isNext(nextRow, nextCol, value))
                    list.push([nextRow, nextCol])
            })

            $timeout(function() {
                list.length ? loop() : deffered.resolve()
            }, speed)
        }

        return function(row, col) {
            animate()

            reset()

            list.push([row, col])

            loop()
        }
    }())
})
}())
