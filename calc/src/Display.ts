export default class Display {
    hasPoint: boolean;
    display: string;

    constructor() {
        this.display = "0.";
        this.hasPoint = false;
    }

    get(): string {
        return this.hasPoint ? this.display : this.display.replace(/\.$/, "");
    }

    set(value: string): void {
        if (value.toString().indexOf(".") < 0) {
            this.display = value + ".";
            this.hasPoint = false;
        } else {
            this.display = value;
            this.hasPoint = true;
        }
    }
}
