import { calcButtonToMethods, Calculator } from "./Calculator";

window.onload = () => {
    const mainDisplay = document.getElementById(
        "txtMainDisplay"
    ) as HTMLInputElement;
    const memoryDisplay = document.getElementById(
        "txtMemoryDisplay"
    ) as HTMLInputElement;

    const calc = new Calculator({
        MainDisplay: mainDisplay,
        MemoryDisplay: memoryDisplay,
        fractionDigits: 8,
    });

    /*
     * 電卓ボタン名 → Calculator のメソッド名
     */

    /*
     * 電卓ボタンの onclick と Calculator のメソッドを関連付け
     */
    for (const name of calcButtonToMethods) {
        // eslint-disable-next-line no-prototype-builtins
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const element = document.getElementById(name)! as HTMLInputElement;
        element.addEventListener("click", () => {
            calc.inputKey(name, element.value);
            return false;
        });
    }

    /*
     * キーコード → 電卓ボタン名
     */
    const keyCodeToCalcButton: { [name: number]: string } = {
        8: "btnBack", // [BackSpace]
        46: "btnClearEnter", // [Del]
        27: "btnClear", // [Esc]
        13: "btnEvaluation", // [Enter]
        120: "btnNegate", // [F9]
    } as const;

    /*
     * キーコード ([Ctrl] 修飾) → 電卓ボタン名
     */
    const keyCodeWithCtrlToCalcButton: {
        [name: number]: string;
    } = {
        76: "btnMemoryClear", // [L]
        82: "btnMemoryRead", // [R]
        77: "btnMemoryStore", // [M]
        80: "btnMemoryAdd", // [P]
    } as const;

    /*
     * 押下キーをキーコードで取得するので、動作がデバイスに依存する。
     * イベントの発生順は、keydown → keypress → keyup。
     * keydown をキャンセルすると、keypress が発生しない。
     */
    document.addEventListener("keydown", (event) => {
        if (event.altKey) {
            return true;
        }
        const code = event.keyCode;
        const name = event.ctrlKey
            ? keyCodeWithCtrlToCalcButton[code]
            : keyCodeToCalcButton[code];

        if (name != null) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const element: HTMLElement = document.getElementById(name)!;
            element.click();
            return false;
        }
        return true;
    });

    /*
     * 印字文字 → 電卓ボタン名
     */
    const printableCharToCalcButton: {
        [name: string]: string;
    } = {
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
    } as const;

    /*
     * 押下キーを文字コードで取得できるので、動作がデバイスに依存しない。
     * IE では、[Alt]/[Ctrl] 修飾時や非印字文字は、keypress が発生しない。
     * 代わりに、keydown で処理する必要がある。
     */
    document.addEventListener("keypress", (event) => {
        if (event.altKey || event.ctrlKey) {
            return true;
        } // Firefox (修飾キー)
        if (event.charCode === 0) {
            return true;
        } // Firefox (非印字文字)

        const code = event.charCode || event.keyCode; // 文字コード
        const ch = String.fromCharCode(code).toUpperCase();

        const name = printableCharToCalcButton[ch];
        if (name) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const element = document.getElementById(name)!;
            element.click();
            return false;
        }

        return true;
    });
};
