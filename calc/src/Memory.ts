export default class Memory {
    memory: number;

    constructor() {
        this.memory = 0;
    }

    get(): number {
        return this.memory;
    }

    set(value: string): void {
        this.memory = parseFloat(value) || 0;
    }

    getMemoryDisplay(): "M" | "" {
        return this.memory != 0 ? "M" : "";
    }
}
