export default class Util {
    /*
		【小数演算誤差修正】
		■ 0.01 + 0.05			→ 0.060000000000000005		→ 0.06
		■ 1.116 - 1.113		→ 0.0030000000000001137	→ 0.003
		■ 1.1116 - 1.1113		→ 0.00029999999999996696	→ 0.0003
		■ 755 * 2.3			→ 1736.4999999999997		→ 1736.5
		■ 1111212212 * 0.01	→ 11112122.120000001		→ 11112122.12
		■ 17.65 * 465000		→ 8207249.999999999		→ 8207250
		■ 17.65 * 0.00465		→ 0.08207249999999999		→ 0.0820725
		■ 0.01 * 0.7			→ 0.006999999999999999		→ 0.007
		■ 0.01 * 0.07			→ 0.0007000000000000001	→ 0.0007
		■ 0.0003 * 0.0007		→ 2.0999999999999997e-7	→ 2.1e-7(=0.00000021)
		■ 1400 / 0.7			→ 2000.0000000000002		→ 2000
		■ 1400 / 0.07			→ 19999.999999999996		→ 20000
	*/

    static readonly MAX_FRACTION_DIGITS = 20;

    /*
     * 小数点以下 n 桁を残して丸める
     */
    static cheat(f: number, n: number): number {
        if (!isFinite(f)) {
            return f;
        }
        n = n || 8; // 既定値 8
        const p = Math.min(Math.max(n, 0), Util.MAX_FRACTION_DIGITS);
        return parseFloat(f.toFixed(p));
    }

    /*
     * 小数点以下 n ～ 20 桁の範囲内で、3 つ以上連続する 0 または 9 を丸める
     */
    static cheatVariably(f: number, n: number): number {
        if (!isFinite(f)) {
            return f;
        }
        n = n || 8; // 既定値 8

        let str = f.toFixed(Util.MAX_FRACTION_DIGITS); // 固定小数点表記
        str = str.replace(/^[^.]+\./, ""); // 整数部除去
        str = str.replace(/0+$/, "");

        const re = /0{3,}|9{3,}/g;
        let p = Util.MAX_FRACTION_DIGITS;
        let m: RegExpExecArray | null;
        while ((m = re.exec(str)) != null) {
            p = m.index; // 複数あるときは最後に一致した位置
        }
        p = Math.min(Math.max(p, n), Util.MAX_FRACTION_DIGITS);

        return parseFloat(f.toFixed(p));
    }
}
