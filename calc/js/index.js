"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Calculator_1 = require("./Calculator");
window.onload = function () {
    var mainDisplay = document.getElementById("txtMainDisplay");
    var memoryDisplay = document.getElementById("txtMemoryDisplay");
    var calc = new Calculator_1.Calculator({
        MainDisplay: mainDisplay,
        MemoryDisplay: memoryDisplay,
        fractionDigits: 8,
    });
    var _loop_1 = function (name_1) {
        // eslint-disable-next-line no-prototype-builtins
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var element = document.getElementById(name_1);
        element.addEventListener("click", function () {
            calc.inputKey(name_1, element.value);
            return false;
        });
    };
    /*
     * 電卓ボタン名 → Calculator のメソッド名
     */
    /*
     * 電卓ボタンの onclick と Calculator のメソッドを関連付け
     */
    for (var _i = 0, calcButtonToMethods_1 = Calculator_1.calcButtonToMethods; _i < calcButtonToMethods_1.length; _i++) {
        var name_1 = calcButtonToMethods_1[_i];
        _loop_1(name_1);
    }
    /*
     * キーコード → 電卓ボタン名
     */
    var keyCodeToCalcButton = {
        8: "btnBack",
        46: "btnClearEnter",
        27: "btnClear",
        13: "btnEvaluation",
        120: "btnNegate",
    };
    /*
     * キーコード ([Ctrl] 修飾) → 電卓ボタン名
     */
    var keyCodeWithCtrlToCalcButton = {
        76: "btnMemoryClear",
        82: "btnMemoryRead",
        77: "btnMemoryStore",
        80: "btnMemoryAdd",
    };
    /*
     * 押下キーをキーコードで取得するので、動作がデバイスに依存する。
     * イベントの発生順は、keydown → keypress → keyup。
     * keydown をキャンセルすると、keypress が発生しない。
     */
    document.addEventListener("keydown", function (event) {
        if (event.altKey) {
            return true;
        }
        var code = event.keyCode;
        var name = event.ctrlKey
            ? keyCodeWithCtrlToCalcButton[code]
            : keyCodeToCalcButton[code];
        if (name != null) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            var element = document.getElementById(name);
            element.click();
            return false;
        }
        return true;
    });
    /*
     * 印字文字 → 電卓ボタン名
     */
    var printableCharToCalcButton = {
        "1": "btnNumber1",
        "2": "btnNumber2",
        "3": "btnNumber3",
        "4": "btnNumber4",
        "5": "btnNumber5",
        "6": "btnNumber6",
        "7": "btnNumber7",
        "8": "btnNumber8",
        "9": "btnNumber9",
        "0": "btnNumber0",
        ".": "btnPoint",
        "+": "btnAddition",
        "-": "btnSubtraction",
        "*": "btnMultiply",
        "/": "btnDivision",
        "=": "btnEvaluation",
        "@": "btnSquareRoot",
        "%": "btnPercentage",
        R: "btnReciprocal",
    };
    /*
     * 押下キーを文字コードで取得できるので、動作がデバイスに依存しない。
     * IE では、[Alt]/[Ctrl] 修飾時や非印字文字は、keypress が発生しない。
     * 代わりに、keydown で処理する必要がある。
     */
    document.addEventListener("keypress", function (event) {
        if (event.altKey || event.ctrlKey) {
            return true;
        } // Firefox (修飾キー)
        if (event.charCode === 0) {
            return true;
        } // Firefox (非印字文字)
        var code = event.charCode || event.keyCode; // 文字コード
        var ch = String.fromCharCode(code).toUpperCase();
        var name = printableCharToCalcButton[ch];
        if (name) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            var element = document.getElementById(name);
            element.click();
            return false;
        }
        return true;
    });
};
