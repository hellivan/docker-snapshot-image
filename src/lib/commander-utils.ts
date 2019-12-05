export class CommanderUtils {
    public static parseStringValue(v: unknown): string | null | never;
    public static parseStringValue(v: unknown, defaultValue: string): string | never;
    public static parseStringValue(v: unknown, defaultValue?: string): string | null | never {
        if (v == null) {
            return defaultValue != null ? defaultValue : null;
        }
        if (typeof v === 'string') {
            return v;
        }
        throw new Error(`Cannot parse '${v}' as string value!`);
    }

    public static parseBooleanValue(v: unknown): boolean | null | never;
    public static parseBooleanValue(v: unknown, defaultValue: boolean): boolean | never;
    public static parseBooleanValue(v: unknown, defaultValue?: boolean): boolean | null | never {
        if (v == null) {
            return defaultValue != null ? defaultValue : null;
        }
        if (typeof v === 'boolean') {
            return v;
        }
        throw new Error(`Cannot parse '${v}' as boolean value!`);
    }
}
