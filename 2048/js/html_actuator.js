"use strict";
var HTMLActuator = /** @class */ (function () {
    function HTMLActuator() {
        this.tileContainer =
            document.querySelector(".tile-container");
        this.scoreContainer =
            document.querySelector(".score-container");
        this.bestContainer =
            document.querySelector(".best-container");
        this.messageContainer =
            document.querySelector(".game-message");
        this.score = 0;
    }
    HTMLActuator.prototype.actuate = function (grid, metadata) {
        var _this = this;
        window.requestAnimationFrame(function () {
            _this.clearContainer(_this.tileContainer);
            grid.cells.forEach(function (column) {
                column.forEach(function (cell) {
                    if (cell) {
                        _this.addTile(cell);
                    }
                });
            });
            _this.updateScore(metadata.score);
            _this.updateBestScore(metadata.bestScore);
            if (metadata.terminated) {
                if (metadata.over) {
                    _this.message(false); // You lose
                }
                else if (metadata.won) {
                    _this.message(true); // You win!
                }
            }
        });
    };
    // Continues the game (both restart and keep playing)
    HTMLActuator.prototype.continueGame = function () {
        this.clearMessage();
    };
    HTMLActuator.prototype.clearContainer = function (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    };
    HTMLActuator.prototype.addTile = function (tile) {
        var _this = this;
        var _a, _b, _c, _d;
        var wrapper = document.createElement("div");
        var inner = document.createElement("div");
        var position = tile.previousPosition || { x: tile.x, y: tile.y };
        var positionClass = this.positionClass(position);
        // We can't use classlist because it somehow glitches when replacing classes
        var classes = ["tile", "tile-" + tile.value, positionClass];
        if (((_a = tile.value) !== null && _a !== void 0 ? _a : 0) > 2048) {
            classes.push("tile-super");
        }
        this.applyClasses(wrapper, classes);
        inner.classList.add("tile-inner");
        inner.textContent = (_c = (_b = tile.value) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : null;
        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(function () {
                classes[2] = _this.positionClass({ x: tile.x, y: tile.y });
                _this.applyClasses(wrapper, classes); // Update the position
            });
        }
        else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);
            // Render the tiles that merged
            tile.mergedFrom.forEach(function (merged) {
                _this.addTile(merged);
            });
        }
        else {
            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
        }
        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);
        // Put the tile on the board
        (_d = this.tileContainer) === null || _d === void 0 ? void 0 : _d.appendChild(wrapper);
    };
    HTMLActuator.prototype.applyClasses = function (element, classes) {
        element.setAttribute("class", classes.join(" "));
    };
    HTMLActuator.prototype.normalizePosition = function (position) {
        return { x: position.x + 1, y: position.y + 1 };
    };
    HTMLActuator.prototype.positionClass = function (position) {
        position = this.normalizePosition(position);
        return "tile-position-" + position.x + "-" + position.y;
    };
    HTMLActuator.prototype.updateScore = function (score) {
        var _a;
        this.clearContainer(this.scoreContainer);
        var difference = score - this.score;
        this.score = score;
        if (this.scoreContainer == null) {
            return;
        }
        this.scoreContainer.textContent = this.score.toString();
        if (difference > 0) {
            var addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = "+" + difference;
            (_a = this.scoreContainer) === null || _a === void 0 ? void 0 : _a.appendChild(addition);
        }
    };
    HTMLActuator.prototype.updateBestScore = function (bestScore) {
        if (this.bestContainer == null) {
            return;
        }
        this.bestContainer.textContent = bestScore.toString();
    };
    HTMLActuator.prototype.message = function (won) {
        var _a;
        var type = won ? "game-won" : "game-over";
        var message = won ? "You win!" : "Game over!";
        (_a = this.messageContainer) === null || _a === void 0 ? void 0 : _a.classList.add(type);
        if (this.messageContainer == null) {
            return;
        }
        this.messageContainer.getElementsByTagName("p")[0].textContent =
            message;
    };
    HTMLActuator.prototype.clearMessage = function () {
        var _a, _b;
        // IE only takes one value to remove at a time.
        (_a = this.messageContainer) === null || _a === void 0 ? void 0 : _a.classList.remove("game-won");
        (_b = this.messageContainer) === null || _b === void 0 ? void 0 : _b.classList.remove("game-over");
    };
    return HTMLActuator;
}());
