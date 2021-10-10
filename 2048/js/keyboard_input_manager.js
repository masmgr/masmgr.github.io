"use strict";
var KeyboardInputManager = /** @class */ (function () {
    function KeyboardInputManager() {
        this.events = {};
        this.eventTouchstart = "touchstart";
        this.eventTouchmove = "touchmove";
        this.eventTouchend = "touchend";
        this.listen();
    }
    KeyboardInputManager.prototype.on = function (event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    };
    KeyboardInputManager.prototype.emit = function (event, data) {
        var callbacks = this.events[event];
        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(data);
            });
        }
    };
    KeyboardInputManager.prototype.listen = function () {
        var _this = this;
        var map = {
            38: Direction.Up,
            39: Direction.Right,
            40: Direction.Down,
            37: Direction.Left,
            75: Direction.Up,
            76: Direction.Right,
            74: Direction.Down,
            72: Direction.Left,
            87: Direction.Up,
            68: Direction.Right,
            83: Direction.Down,
            65: Direction.Left,
        };
        // Respond to direction keys
        document.addEventListener("keydown", function (event) {
            var modifiers = event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey;
            var mapped = map[event.which];
            if (!modifiers) {
                if (mapped !== undefined) {
                    event.preventDefault();
                    _this.emit("move", mapped);
                }
            }
            // R key restarts the game
            if (!modifiers && event.which === 82) {
                _this.restart.call(self, event);
            }
        });
        // Respond to button presses
        this.bindButtonPress(".retry-button", this.restart);
        this.bindButtonPress(".restart-button", this.restart);
        this.bindButtonPress(".keep-playing-button", this.keepPlaying);
        // Respond to swipe events
        var touchStartClientX, touchStartClientY;
        var gameContainer = document.getElementsByClassName("game-container")[0];
        gameContainer.addEventListener(this.eventTouchstart, (function (event) {
            if (event.touches.length > 1 || event.targetTouches.length > 1) {
                return; // Ignore if touching with more than 1 finger
            }
            touchStartClientX = event.touches[0].clientX;
            touchStartClientY = event.touches[0].clientY;
            event.preventDefault();
        }));
        gameContainer.addEventListener(this.eventTouchmove, (function (event) {
            event.preventDefault();
        }));
        gameContainer.addEventListener(this.eventTouchend, (function (event) {
            // Remove code msPointerEnabled
            if (event.touches.length > 0 || event.targetTouches.length > 0) {
                return; // Ignore if still touching with one or more fingers
            }
            var touchEndClientX = event.changedTouches[0].clientX;
            var touchEndClientY = event.changedTouches[0].clientY;
            var dx = touchEndClientX - touchStartClientX;
            var absDx = Math.abs(dx);
            var dy = touchEndClientY - touchStartClientY;
            var absDy = Math.abs(dy);
            if (Math.max(absDx, absDy) > 10) {
                var direction = void 0;
                if (absDx > absDy) {
                    if (dx > 0) {
                        direction = Direction.Right;
                    }
                    else {
                        direction = Direction.Left;
                    }
                }
                else {
                    if (dy > 0) {
                        direction = Direction.Down;
                    }
                    else {
                        direction = Direction.Up;
                    }
                }
                // (right : left) : (down : up)
                _this.emit("move", direction);
            }
        }));
    };
    KeyboardInputManager.prototype.restart = function (event) {
        event.preventDefault();
        this.emit("restart");
    };
    KeyboardInputManager.prototype.keepPlaying = function (event) {
        event.preventDefault();
        this.emit("keepPlaying");
    };
    KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
        var button = document.querySelector(selector);
        button === null || button === void 0 ? void 0 : button.addEventListener("click", fn.bind(this));
        button === null || button === void 0 ? void 0 : button.addEventListener(this.eventTouchend, fn.bind(this));
    };
    return KeyboardInputManager;
}());
