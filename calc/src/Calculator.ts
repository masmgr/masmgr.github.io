import Util from "./Util";
import Display from "./Display";
import Memory from "./Memory";
import ErrorLib from "./ErrorLib";

export const calcButtonToMethods = [
    "btnBack",
    "btnClearEnter",
    "btnClear",
    "btnNumber1",
    "btnNumber2",
    "btnNumber3",
    "btnNumber4",
    "btnNumber5",
    "btnNumber6",
    "btnNumber7",
    "btnNumber8",
    "btnNumber9",
    "btnNumber0",
    "btnNegate",
    "btnPoint",
    "btnAddition",
    "btnSubtraction",
    "btnMultiply",
    "btnDivision",
    "btnEvaluation",
    "btnSquareRoot",
    "btnPercentage",
    "btnReciprocal",
    "btnMemoryClear",
    "btnMemoryRead",
    "btnMemoryStore",
    "btnMemoryAdd",
] as const;
export type calcButtonToMethod = typeof calcButtonToMethods[number];

const StatusTypes = {
    /**
     * 演算子エラー
     */
    OPERATION_ERROR: -1,
    /**
     * 演算対象1入力待ち
     */
    OPERAND1_ENTRY: 1,
    /**
     * 演算対象1入力中 → 演算対象1入力待ち
     */
    OPERAND1_INPUT: 2,
    /**
     * 演算対象2入力待ち
     */
    OPERAND2_ENTRY: 3,
    /**
     * 演算対象2入力中 → 演算対象2入力待ち
     */
    OPERAND2_INPUT: 4,
} as const;
export type StatusTypes = typeof StatusTypes[keyof typeof StatusTypes];

export class Calculator {
    readonly MainDisplay: HTMLInputElement;
    readonly MemoryDisplay: HTMLInputElement;

    /**
     * 状態変数
     */
    status: StatusTypes;
    operand1: number;
    operand2: number;
    /**
     * 2 項演算子
     */
    operator: string;

    readonly display: Display;
    readonly memory: Memory;
    readonly fractionDigits: number;
    readonly maxLength: number;

    constructor(param: {
        MainDisplay: HTMLInputElement;
        MemoryDisplay: HTMLInputElement;
        fractionDigits: number;
    }) {
        this.MainDisplay = param.MainDisplay;
        this.MemoryDisplay = param.MemoryDisplay;
        this.fractionDigits = param.fractionDigits || 8;

        this.MainDisplay.value = "0.";
        this.MemoryDisplay.value = "";
        this.status = StatusTypes.OPERAND1_ENTRY;
        this.operand1 = 0;
        this.operand2 = 0;
        this.operator = "";
        this.display = new Display();
        this.memory = new Memory();

        this.maxLength = this.MainDisplay.maxLength || 16;
    }

    /**
     *
     * @param value
     * @returns
     */
    inputKey(key: calcButtonToMethod, value: string): void {
        switch (key) {
            case "btnBack":
                this.back();
                break;
            case "btnClearEnter":
                this.clearEnter();
                break;
            case "btnClear":
                this.clear();
                break;
            case "btnNumber1":
            case "btnNumber2":
            case "btnNumber3":
            case "btnNumber4":
            case "btnNumber5":
            case "btnNumber6":
            case "btnNumber7":
            case "btnNumber8":
            case "btnNumber9":
            case "btnNumber0":
                this.inputNumber(value);
                break;
            case "btnNegate":
                this.negate();
                break;
            case "btnPoint":
                this.inputPoint();
                break;
            case "btnAddition":
            case "btnSubtraction":
            case "btnMultiply":
            case "btnDivision":
                this.inputOperator(value);
                break;
            case "btnEvaluation":
                this.evaluate();
                break;
            case "btnSquareRoot":
                this.inputSquareRoot();
                break;
            case "btnPercentage":
                this.inputPercentage();
                break;
            case "btnReciprocal":
                this.inputReciprocal();
                break;
            case "btnMemoryClear":
                this.clearMemory();
                break;
            case "btnMemoryRead":
                this.readMemory();
                break;
            case "btnMemoryStore":
                this.storeMemory();
                break;
            case "btnMemoryAdd":
                this.addMemory();
                break;
            default:
                break;
        }
    }

    /**
     * エラー表示
     */
    operationErrorHandler(value: number): boolean {
        if (isFinite(value)) {
            return false;
        }

        let msg = "";

        if (
            isNaN(value) &&
            this.operator == "/" &&
            this.operand1 == 0 &&
            this.operand2 == 0
        ) {
            // * 非数(虚数以外)
            msg = "関数の結果が定義されていません。";
        } else if (isNaN(value)) {
            // * 非数(虚数)
            msg = "無効な値です。";
        } else if (this.operand2 == 0) {
            // * 無限大(ゼロ除算、ゼロ逆数)
            msg = "0 で割ることはできません。";
        } else {
            // * 無限大(ゼロ除算、ゼロ逆数以外)
            msg = "オーバーフローしました。";
        }

        this.clear();
        this.display.set(msg);
        this.status = StatusTypes.OPERATION_ERROR;

        return true;
    }

    /**
     * 表示値の取得
     */
    getDisplay(): string {
        return this.display.get();
    }

    /**
     * 表示値の設定
     */
    setDisplay(value: string | number): void {
        if (typeof value === "number") {
            this.display.set(value.toString());
        } else {
            this.display.set(value);
        }
        this.MainDisplay.value = this.display.get();
    }

    /*
     * メモリ値の取得
     */
    getMemory(): number {
        return this.memory.get();
    }

    /**
     * メモリ値の設定
     */
    setMemory(value: string | number): void {
        if (typeof value === "number") {
            this.memory.set(value.toString());
        } else {
            this.memory.set(value);
        }
        this.MemoryDisplay.value = this.memory.getMemoryDisplay();
    }

    /**
     * [C]
     */
    clear(): boolean {
        // * メモリ値は除く
        this.setDisplay("0");
        this.status = StatusTypes.OPERAND1_ENTRY;
        this.operand1 = 0;
        this.operand2 = 0;
        this.operator = "";
        return true;
    }

    /**
     * [CE]
     */
    clearEnter(): boolean {
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中
            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中
                this.setDisplay("0");
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示 → 演算対象1入力待ち
                this.clear();
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [Back]
     *
     * 【負符号や小数点があるとき】
     * ■ -1.5 [Back]								→ -1.
     * ■ -1.5 [Back] [2]							→ -1.2
     * ■ -1.5 [Back] [Back]						→ -1
     * ■ -1.5 [Back] [Back] [2]					→ -12
     * ■ -1.5 [Back] [Back] [Back]					→ 0
     * ■ -1.5 [Back] [Back] [Back] [2]				→ 2
     *
     * 【負符号と小数点があり、かつ先頭が 0 のとき】
     * ■ -0.5 [Back] [Back]						→ 0
     * ■ -0.5 [Back] [Back] [2]					→ 2
     *
     * 【入力中以外は無効】
     * ■ 0.0003 [*] 0.0007 [=] [Back] [Back] ..	→ 2.1e-7 以降無反応
     */
    back(): boolean {
        let value: string;
        switch (this.status) {
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中
                value = this.getDisplay();
                if (/^-?.$/.test(value)) {
                    value = "0";
                } else if (value == "-0.") {
                    value = "0";
                } else {
                    value = value.slice(0, -1);
                }
                this.setDisplay(value);
                break;

            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [0] .. [9] 数値
     */
    inputNumber(str: string): boolean {
        const n = parseInt(str);
        let value: string;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち → 演算対象1入力中
                this.setDisplay(n);
                this.status = StatusTypes.OPERAND1_INPUT;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち → 演算対象2入力中
                this.setDisplay(n);
                this.status = StatusTypes.OPERAND2_INPUT;
                break;

            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中
                value = this.getDisplay();
                value = value.replace(/^0+$/, "");
                if (value.length < this.maxLength) {
                    this.setDisplay(value + n);
                }
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [.] 小数点
     */
    inputPoint(): boolean {
        let value: string;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち → 演算対象1入力中
                this.setDisplay("0.");
                this.status = StatusTypes.OPERAND1_INPUT;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち → 演算対象2入力中
                this.setDisplay("0.");
                this.status = StatusTypes.OPERAND2_INPUT;
                break;

            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中
                value = this.getDisplay();
                if (value.indexOf(".") < 0) {
                    this.setDisplay(value + ".");
                }
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [+/-] 符号反転
     */
    negate(): boolean {
        let value: string;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中
                value = this.getDisplay();
                if (value != "0") {
                    if (value.charAt(0) != "-") {
                        value = "-" + value;
                    } else {
                        value = value.substring(1);
                    }
                    this.setDisplay(value);
                }
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち → 未定義
            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;
            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [+] [-] [*] [/] 四則演算子
     */
    inputOperator(ope: string): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち		→ 演算対象2入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中		→ 演算対象2入力待ち
                value = parseFloat(this.getDisplay());
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.operand1 = value;
                this.operator = ope;
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
                this.operator = ope;
                break;

            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                if (!this.evaluate()) {
                    return false;
                }
                value = parseFloat(this.getDisplay());
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.operand1 = value;
                this.operator = ope;
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [=] 四則演算実行
     */
    evaluate(): boolean {
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中 → 演算対象1入力待ち
                if (this.operator) {
                    this.operand1 = parseFloat(this.getDisplay());
                    let value = eval(
                        this.operand1 +
                            " " +
                            this.operator +
                            " " +
                            this.operand2
                    );
                    if (this.operationErrorHandler(value)) {
                        return false;
                    } // ゼロ除算
                    value = Util.cheatVariably(value, this.fractionDigits);
                    this.setDisplay(value);
                    this.status = StatusTypes.OPERAND1_ENTRY;
                }
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち		→ 演算対象1入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中		→ 演算対象1入力待ち
                if (this.operator) {
                    this.operand2 = parseFloat(this.getDisplay());
                    let value = eval(
                        this.operand1 +
                            " " +
                            this.operator +
                            " " +
                            this.operand2
                    );
                    if (this.operationErrorHandler(value)) {
                        return false;
                    } // ゼロ除算
                    value = Util.cheatVariably(value, this.fractionDigits);
                    this.setDisplay(value);
                    this.status = StatusTypes.OPERAND1_ENTRY;
                }
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [sqrt] 平方根
     */
    inputSquareRoot(): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中		→ 演算対象1入力待ち
            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち		→ 演算対象1入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中		→ 演算対象1入力待ち
                value = parseFloat(this.getDisplay());
                value = Math.sqrt(value);
                if (this.operationErrorHandler(value)) {
                    return false;
                } // 虚数
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.operand1 = value;
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [1/x] 逆数
     */
    inputReciprocal(): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中		→ 演算対象1入力待ち
            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち		→ 演算対象1入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中		→ 演算対象1入力待ち
                value = parseFloat(this.getDisplay());
                value = 1 / value;
                if (this.operationErrorHandler(value)) {
                    return false;
                } // ゼロ除算
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.operand1 = value;
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [%] 百分率 (Ver.1)
     *
     * 【[%]押下後に途中結果を表示、[=]押下後に最終結果を表示】
     * ■ x [+] y [%] [=] → x + (x * (y / 100))
     * ■ x [-] y [%] [=] → x - (x * (y / 100))
     * ■ x [*] y [%] [=] → x * (x * (y / 100))
     * ■ x [/] y [%] [=] → x / (x * (y / 100))
     *
     * 【[=]連続押下時、初回のみ[%]が考慮される】
     * ■ x [*] y [%] [=] [=] [=] .. → x * (y / 100) * y * y ..
     * ■ x [*] [%] [=] [=] [=] .. → x * (x / 100) * x * x ..
     * ■ x [*] [%] [%] [%] .. → x * ((((x / 100) * (x / 100)) * (x / 100)) .. )
     */
    inputPercentage(): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中 → 演算対象1入力待ち
                value = parseFloat(this.getDisplay());
                value = (this.operand1 * value) / 100;
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                value = parseFloat(this.getDisplay());
                value = (this.operand1 * value) / 100;
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [%] 百分率 (Ver.2)
     *
     * 【[%]押下後に最終結果を表示】
     * ■ x [+] y [%] → x + (x * (y / 100))
     * ■ x [-] y [%] → x - (x * (y / 100))
     * ■ x [*] y [%] → x * (y / 100)
     * ■ x [/] y [%] → x / (y / 100)
     *
     * 【[=]連続押下時、常に[%]が考慮される】
     * ■ x [*] y [%] [=] [=] [=] .. → x * (y / 100) * (y / 100) * (y / 100) ..
     * ■ x [*] [%] [=] [=] [=] .. → x * (x / 100) * (x / 100) * (x / 100) ..
     * ■ x [*] [%] [%] [%] .. → x * (x / 100) 以降無反応
     */
    inputPercentage2(): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                value = parseFloat(this.getDisplay());
                value /= 100;
                if (this.operator == "+" || this.operator == "-") {
                    value *= this.operand1;
                }
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setDisplay(value);
                this.status = StatusTypes.OPERAND2_ENTRY;
                if (!this.evaluate()) {
                    return false;
                }
                break;

            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中
            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [MC]
     */
    clearMemory(): boolean {
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中 → 演算対象1入力待ち
                this.setMemory(0);
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                this.setMemory(0);
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [MR]
     */
    readMemory(): boolean {
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中 → 演算対象1入力待ち
                this.setDisplay(this.getMemory());
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                this.setDisplay(this.getMemory());
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [MS]
     */
    storeMemory(): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中 → 演算対象1入力待ち
                value = parseFloat(this.getDisplay());
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setMemory(value);
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                value = parseFloat(this.getDisplay());
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setMemory(value);
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }

    /**
     * [M+]
     */
    addMemory(): boolean {
        let value: number;
        switch (this.status) {
            case StatusTypes.OPERAND1_ENTRY: // 演算対象1入力待ち
            case StatusTypes.OPERAND1_INPUT: // 演算対象1入力中 → 演算対象1入力待ち
                value = this.getMemory() + parseFloat(this.getDisplay());
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setMemory(value);
                this.status = StatusTypes.OPERAND1_ENTRY;
                break;

            case StatusTypes.OPERAND2_ENTRY: // 演算対象2入力待ち
            case StatusTypes.OPERAND2_INPUT: // 演算対象2入力中 → 演算対象2入力待ち
                value = this.getMemory() + parseFloat(this.getDisplay());
                if (this.operationErrorHandler(value)) {
                    return false;
                }
                value = Util.cheatVariably(value, this.fractionDigits);
                this.setMemory(value);
                this.status = StatusTypes.OPERAND2_ENTRY;
                break;

            case StatusTypes.OPERATION_ERROR: // エラー表示
                break;

            default:
                ErrorLib.assertNever(this.status);
        }

        return true;
    }
}
