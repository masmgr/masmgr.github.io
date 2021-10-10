"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorLib = /** @class */ (function () {
    function ErrorLib() {
    }
    ErrorLib.assertNever = function (value, message) {
        throw new Error(message !== null && message !== void 0 ? message : "Illegal value: " + value);
    };
    return ErrorLib;
}());
exports.default = ErrorLib;
