"use strict";
var Direction = {
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3,
};
var VectorDirection = {
    Zero: 0,
    Plus: 1,
    Minus: -1,
};
var GameManager = /** @class */ (function () {
    function GameManager(size) {
        this.size = size; // Size of the grid
        this.inputManager = new KeyboardInputManager();
        this.storageManager = new LocalStorageManager();
        this.actuator = new HTMLActuator();
        this.startTiles = 2;
        this.inputManager.on("move", this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));
        this.inputManager.on("keepPlaying", this.keepPlay.bind(this));
        this.grid = new Grid(this.size);
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;
        this.setup();
    }
    // Restart the game
    GameManager.prototype.restart = function () {
        this.storageManager.clearGameState();
        this.actuator.continueGame(); // Clear the game won/lost message
        this.setup();
    };
    // Keep playing after winning (allows going over 2048)
    GameManager.prototype.keepPlay = function () {
        this.keepPlaying = true;
        this.actuator.continueGame(); // Clear the game won/lost message
    };
    // Return true if the game is lost, or has won and the user hasn't kept playing
    GameManager.prototype.isGameTerminated = function () {
        return this.over || (this.won && !this.keepPlaying);
    };
    // Set up the game
    GameManager.prototype.setup = function () {
        var previousState = this.storageManager.getGameState();
        // Reload the game from a previous game if present
        if (previousState) {
            this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
            this.score = previousState.score;
            this.over = previousState.over;
            this.won = previousState.won;
            this.keepPlaying = previousState.keepPlaying;
        }
        else {
            this.grid = new Grid(this.size);
            this.score = 0;
            this.over = false;
            this.won = false;
            this.keepPlaying = false;
            // Add the initial tiles
            this.addStartTiles();
        }
        // Update the actuator
        this.actuate();
    };
    // Set up the initial tiles to start the game with
    GameManager.prototype.addStartTiles = function () {
        for (var i = 0; i < this.startTiles; i++) {
            this.addRandomTile();
        }
    };
    // Adds a tile in a random position
    GameManager.prototype.addRandomTile = function () {
        if (this.grid.cellsAvailable()) {
            var value = Math.random() < 0.9 ? 2 : 4;
            var tile = new Tile(this.grid.randomAvailableCell(), value);
            this.grid.insertTile(tile);
        }
    };
    // Sends the updated grid to the actuator
    GameManager.prototype.actuate = function () {
        if (this.storageManager.getBestScore() < this.score) {
            this.storageManager.setBestScore(this.score);
        }
        // Clear the state when the game is over (game over only, not win)
        if (this.over) {
            this.storageManager.clearGameState();
        }
        else {
            this.storageManager.setGameState(this.serialize());
        }
        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated(),
        });
    };
    // Represent the current game as an object
    GameManager.prototype.serialize = function () {
        return {
            grid: this.grid.serialize(),
            score: this.score,
            over: this.over,
            won: this.won,
            keepPlaying: this.keepPlaying,
        };
    };
    // Save all tile positions and remove merger info
    GameManager.prototype.prepareTiles = function () {
        this.grid.eachCell(function (x, y, tile) {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    };
    // Move a tile and its representation
    GameManager.prototype.moveTile = function (tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    };
    // Move tiles on the grid in the specified direction
    GameManager.prototype.move = function (direction) {
        var _this = this;
        if (direction == null)
            return;
        // 0: up, 1: right, 2: down, 3: left
        if (this.isGameTerminated())
            return; // Don't do anything if the game's over
        var cell, tile;
        var vector = this.getVector(direction);
        var traversals = this.buildTraversals(vector);
        var moved = false;
        // Save the current tile positions and remove merger information
        this.prepareTiles();
        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach(function (x) {
            traversals.y.forEach(function (y) {
                var _a, _b;
                cell = { x: x, y: y };
                tile = _this.grid.cellContent(cell);
                if (tile) {
                    var positions = _this.findFarthestPosition(cell, vector);
                    var next = _this.grid.cellContent(positions.next);
                    // Only one merger per row traversal?
                    if (next && next.value === tile.value && !next.mergedFrom) {
                        var merged = new Tile(positions.next, ((_a = tile === null || tile === void 0 ? void 0 : tile.value) !== null && _a !== void 0 ? _a : 0) * 2);
                        merged.mergedFrom = [tile, next];
                        _this.grid.insertTile(merged);
                        _this.grid.removeTile(tile);
                        // Converge the two tiles' positions
                        tile.updatePosition(positions.next);
                        // Update the score
                        _this.score += (_b = merged.value) !== null && _b !== void 0 ? _b : 0;
                        // The mighty 2048 tile
                        if (merged.value === 2048)
                            _this.won = true;
                    }
                    else {
                        _this.moveTile(tile, positions.farthest);
                    }
                    if (!_this.positionsEqual(cell, tile)) {
                        moved = true; // The tile moved from its original cell!
                    }
                }
            });
        });
        if (moved) {
            this.addRandomTile();
            if (!this.movesAvailable()) {
                this.over = true; // Game over!
            }
            this.actuate();
        }
    };
    // Get the vector representing the chosen direction
    GameManager.prototype.getVector = function (direction) {
        // Vectors representing tile movement
        var map = {
            0: { x: VectorDirection.Zero, y: VectorDirection.Minus },
            1: { x: VectorDirection.Plus, y: VectorDirection.Zero },
            2: { x: VectorDirection.Zero, y: VectorDirection.Plus },
            3: { x: VectorDirection.Minus, y: VectorDirection.Zero },
        };
        return map[direction];
    };
    // Build a list of positions to traverse in the right order
    GameManager.prototype.buildTraversals = function (vector) {
        var traversals = {
            x: [],
            y: [],
        };
        for (var pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1)
            traversals.x = traversals.x.reverse();
        if (vector.y === 1)
            traversals.y = traversals.y.reverse();
        return traversals;
    };
    GameManager.prototype.findFarthestPosition = function (cell, vector) {
        var previous;
        // Progress towards the vector direction until an obstacle is found
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));
        return {
            farthest: previous,
            next: cell,
        };
    };
    GameManager.prototype.movesAvailable = function () {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    };
    // Check for available matches between tiles (more expensive check)
    GameManager.prototype.tileMatchesAvailable = function () {
        var tile;
        for (var x = 0; x < this.size; x++) {
            for (var y = 0; y < this.size; y++) {
                tile = this.grid.cellContent({ x: x, y: y });
                if (tile) {
                    for (var _i = 0, _a = [
                        Direction.Up,
                        Direction.Right,
                        Direction.Down,
                        Direction.Left,
                    ]; _i < _a.length; _i++) {
                        var direction = _a[_i];
                        var vector = this.getVector(direction);
                        var cell = { x: x + vector.x, y: y + vector.y };
                        var other = this.grid.cellContent(cell);
                        if (other && other.value === tile.value) {
                            return true; // These two tiles can be merged
                        }
                    }
                }
            }
        }
        return false;
    };
    GameManager.prototype.positionsEqual = function (first, second) {
        return first.x === second.x && first.y === second.y;
    };
    return GameManager;
}());
