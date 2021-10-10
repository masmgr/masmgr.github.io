"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Memory = /** @class */ (function () {
    function Memory() {
        this.memory = 0;
    }
    Memory.prototype.get = function () {
        return this.memory;
    };
    Memory.prototype.set = function (value) {
        this.memory = parseFloat(value) || 0;
    };
    Memory.prototype.getMemoryDisplay = function () {
        return this.memory != 0 ? "M" : "";
    };
    return Memory;
}());
exports.default = Memory;
