/*global angular */

(function() {
'use strict';

var APP = angular.module('matrixApp', [])
  , FPS = 1000 / 1.5

function isInside(matrix, row, col) {
    return 0 <= row && row < matrix.length && 0 <= col && col < matrix[row].length
}

var getSampleMatrix = (function() {
    var sampleMatrix =
        [ [1, 3, 2, 2, 2, 4]
        , [3, 3, 3, 2, 4, 4]
        , [4, 3, 1, 2, 3, 3]
        , [4, 3, 1, 3, 3, 1]
        , [4, 3, 3, 3, 1, 1]
    ]

    return function() {
        var matrix = []

        sampleMatrix.forEach(function(row) {
            matrix.push([])

            row.forEach(function(cell) {
                matrix[matrix.length - 1].push({
                    value: cell,
                    visited: false
                })
            })
        })

        return matrix
    }
}())

APP.controller('matrixController', function($scope, $timeout) {
    function reset() {
        $scope.matrix.forEach(function(row) {
            row.forEach(function(cell) {
                cell.visited = false
            })
        })
    }

    function isNext(row, col, nextRow, nextCol) {
        if (!isInside($scope.matrix, nextRow, nextCol))
            return false

        if ($scope.matrix[nextRow][nextCol].visited)
            return false

        if ($scope.matrix[nextRow][nextCol].value != $scope.matrix[row][col].value)
            return false

        return true
    }

    function makeNext(row, col) {
        return function() {
            BFS(row, col)
        }
    }

    var BFS = (function() {
        var directions = [ [1, 0], [0, 1], [-1, 0], [0, -1] ]

        return function(row, col) {
            $scope.matrix[row][col].visited = true

            directions.forEach(function(direction, i) {
                var nextRow = row + direction[0]
                  , nextCol = col + direction[1]

                if (isNext(row, col, nextRow, nextCol))
                    $timeout(makeNext(nextRow, nextCol), FPS) // Make loop closure
            })
        }
    }())

    // SCOPE
    $scope.matrix = getSampleMatrix()

    $scope.start = function(row, col) {
        reset(), BFS(row, col)
    }
})
}())
