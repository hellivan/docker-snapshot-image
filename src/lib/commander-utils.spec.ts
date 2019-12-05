import { CommanderUtils } from './commander-utils';

describe('CommanderUtils', () => {
    describe('parseStringValue', () => {
        test('parseStringValue should return null for undefined value', () => {
            expect(CommanderUtils.parseStringValue(undefined)).toStrictEqual(null);
        });

        test('parseStringValue should return null for null value', () => {
            expect(CommanderUtils.parseStringValue(null)).toStrictEqual(null);
        });

        test('parseStringValue should return value as string for strings', () => {
            expect(CommanderUtils.parseStringValue('test')).toStrictEqual('test');
        });

        test('parseStringValue should return value if defined and default value is passed', () => {
            expect(CommanderUtils.parseStringValue('test', 'default')).toStrictEqual('test');
        });

        test('parseStringValue should return value if defined and default value is passed', () => {
            expect(CommanderUtils.parseStringValue(null, 'default')).toStrictEqual('default');
        });

        test('parseStringValue should throw an error for non-string values', () => {
            expect.assertions(1);
            try {
                CommanderUtils.parseStringValue(42);
            } catch (err) {
                expect(err.message).toEqual(`Cannot parse '42' as string value!`);
            }
        });
    });

    describe('parseBooleanValue', () => {
        test('parseBooleanValue should return null for undefined value', () => {
            expect(CommanderUtils.parseBooleanValue(undefined)).toStrictEqual(null);
        });

        test('parseBooleanValue should return null for null value', () => {
            expect(CommanderUtils.parseBooleanValue(null)).toStrictEqual(null);
        });

        test('parseBooleanValue should return value as string for strings', () => {
            expect(CommanderUtils.parseBooleanValue(true)).toStrictEqual(true);
        });

        test('parseBooleanValue should return value if defined and default value is passed', () => {
            expect(CommanderUtils.parseBooleanValue(false, true)).toStrictEqual(false);
        });

        test('parseBooleanValue should return value if defined and default value is passed', () => {
            expect(CommanderUtils.parseBooleanValue(null, true)).toStrictEqual(true);
        });

        test('parseBooleanValue should throw an error for non-string values', () => {
            expect.assertions(1);
            try {
                CommanderUtils.parseBooleanValue(42);
            } catch (err) {
                expect(err.message).toEqual(`Cannot parse '42' as boolean value!`);
            }
        });
    });
});
