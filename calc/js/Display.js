"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Display = /** @class */ (function () {
    function Display() {
        this.display = "0.";
        this.hasPoint = false;
    }
    Display.prototype.get = function () {
        return this.hasPoint ? this.display : this.display.replace(/\.$/, "");
    };
    Display.prototype.set = function (value) {
        if (value.toString().indexOf(".") < 0) {
            this.display = value + ".";
            this.hasPoint = false;
        }
        else {
            this.display = value;
            this.hasPoint = true;
        }
    };
    return Display;
}());
exports.default = Display;
