/*global angular */

(function() {
'use strict';

var APP = angular.module('app', [])
  , FPS = 1000 / 2 // Timeout delay

  , sampleMatrix =
    [ [1, 3, 2, 2, 2, 4]
    , [3, 3, 3, 2, 4, 4]
    , [4, 3, 1, 2, 3, 3]
    , [4, 3, 1, 3, 3, 1]
    , [4, 3, 3, 3, 1, 1]
    ]

APP.controller('ctrl', function($scope, $timeout) {
    $scope.type = "DFS"

    $scope.currentLength = 0

    $scope.animating = false

    $scope.matrix = (function() {
        var matrix = []

        sampleMatrix.forEach(function(row) {
            matrix.push([])

            row.forEach(function(cell) {
                matrix[matrix.length - 1].push({ value: cell, visited: false })
            })
        })

        return matrix
    }())

    $scope.traverse = (function() {
        var directions = [ [1, 0], [0, 1], [-1, 0], [0, -1] ]

          , list = []

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
            console.log(row, col)

            $scope.currentLength++

            $scope.matrix[row][col].visited = true
        }

        // Recursive loop with timeout
        function loop(row, col) {
            var cell = list[{ 'DFS': 'pop', 'BFS': 'shift' }[$scope.type]]() // Get the first or last element
              , node = $scope.matrix[cell.row][cell.col]

            if (!node.visited) {
                visit(cell.row, cell.col)

                directions.forEach(function(direction) {
                    var nextRow = cell.row + direction[0]
                      , nextCol = cell.col + direction[1]

                    if (isNext(nextRow, nextCol, node.value))
                        list.push({ row: nextRow, col: nextCol })
                })
            }

            if (list.length) return $timeout(loop, FPS)

            // TODO: Deferred
            $timeout(function() {
                $scope.animating = false
            }, FPS)
        }

        return function(row, col) {
            if ($scope.animating) return
            else $scope.animating = true

            reset()

            list.push({ row: row, col: col })

            loop()
        }
    }())
})
}())
