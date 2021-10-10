export default class ErrorLib {
    static assertNever(value: never, message?: string): never {
        throw new Error(message ?? `Illegal value: ${value}`);
    }
}
