"use strict";
var Grid = /** @class */ (function () {
    function Grid(size, previousState) {
        this.size = size;
        this.cells = previousState
            ? this.fromState(previousState)
            : this.empty();
    }
    // Build a grid of the specified size
    Grid.prototype.empty = function () {
        var cells = [];
        for (var x = 0; x < this.size; x++) {
            var row = (cells[x] = []);
            for (var y = 0; y < this.size; y++) {
                row.push(null);
            }
        }
        return cells;
    };
    Grid.prototype.fromState = function (state) {
        var cells = [];
        for (var x = 0; x < this.size; x++) {
            var row = (cells[x] = []);
            for (var y = 0; y < this.size; y++) {
                var tile = state[x][y];
                if (tile) {
                    var position = { x: tile.position.x, y: tile.position.y };
                    row.push(new Tile(position, tile.value));
                }
                else {
                    row.push(null);
                }
            }
        }
        return cells;
    };
    // Find the first available random position
    Grid.prototype.randomAvailableCell = function () {
        var cells = this.availableCells();
        return cells[Math.floor(Math.random() * cells.length)];
    };
    Grid.prototype.availableCells = function () {
        var cells = [];
        this.eachCell(function (x, y, tile) {
            if (!tile) {
                cells.push({ x: x, y: y });
            }
        });
        return cells;
    };
    // Call callback for every cell
    Grid.prototype.eachCell = function (callback) {
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }
    };
    // Check if there are any cells available
    Grid.prototype.cellsAvailable = function () {
        return !!this.availableCells().length;
    };
    // Check if the specified cell is taken
    Grid.prototype.cellAvailable = function (cell) {
        return !this.cellOccupied(cell);
    };
    Grid.prototype.cellOccupied = function (cell) {
        return !!this.cellContent(cell);
    };
    Grid.prototype.cellContent = function (cell) {
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        }
        else {
            return null;
        }
    };
    // Inserts a tile at its position
    Grid.prototype.insertTile = function (tile) {
        this.cells[tile.x][tile.y] = tile;
    };
    Grid.prototype.removeTile = function (tile) {
        this.cells[tile.x][tile.y] = null;
    };
    Grid.prototype.withinBounds = function (position) {
        return (position.x >= 0 &&
            position.x < this.size &&
            position.y >= 0 &&
            position.y < this.size);
    };
    Grid.prototype.serialize = function () {
        var _a, _b;
        var cellState = [];
        for (var x = 0; x < this.size; x++) {
            var row = (cellState[x] = []);
            for (var y = 0; y < this.size; y++) {
                row.push((_b = (_a = this === null || this === void 0 ? void 0 : this.cells[x][y]) === null || _a === void 0 ? void 0 : _a.serialize()) !== null && _b !== void 0 ? _b : null);
            }
        }
        return {
            size: this.size,
            cells: cellState,
        };
    };
    return Grid;
}());
