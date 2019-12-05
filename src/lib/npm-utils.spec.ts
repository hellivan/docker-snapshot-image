const existsSyncMockFn = jest.fn();
const resolveMockFn = jest.fn();
const readJsonFileMockFn = jest.fn();
jest.mock('fs', () => ({
    existsSync: existsSyncMockFn
}));
jest.mock('path', () => ({
    resolve: resolveMockFn
}));
jest.mock('./json-utils', () => ({
    JsonUtils: {
        readJsonFile: readJsonFileMockFn
    }
}));

import { NpmUtils } from './npm-utils';

describe('npm-utils', () => {
    const mockedPackageInfo = { name: 'test', version: 0 };

    beforeEach(() => {
        existsSyncMockFn.mockRestore();
        resolveMockFn.mockRestore();
        readJsonFileMockFn.mockRestore();
        jest.restoreAllMocks();
    });

    test('getPackageInfo should read package-json-file if it exists', async () => {
        const resolveSpy = resolveMockFn.mockImplementationOnce(path => `${path}_resolved`);
        const existsSyncSpy = existsSyncMockFn.mockImplementationOnce(() => true);
        const readJsonFileSpy = readJsonFileMockFn.mockImplementationOnce(() => Promise.resolve(mockedPackageInfo));
        const result = await NpmUtils.getPackageInfo('./package.json');
        expect(result).toEqual(mockedPackageInfo);
        expect(resolveSpy).toHaveBeenCalledWith('./package.json');
        expect(existsSyncSpy).toHaveBeenCalledWith('./package.json_resolved');
        expect(readJsonFileSpy).toHaveBeenCalledWith('./package.json_resolved');
    });

    test('getPackageInfo should throw an error if package-json-file not exists', async () => {
        expect.assertions(3);
        const resolveSpy = resolveMockFn.mockImplementationOnce(path => `${path}_resolved`);
        const existsSyncSpy = existsSyncMockFn.mockImplementationOnce(() => false);

        try {
            await NpmUtils.getPackageInfo('./package.json');
        } catch (err) {
            expect(err.message).toEqual(`Packageinfo file './package.json' not not found!`);
        }

        expect(resolveSpy).toHaveBeenCalledWith('./package.json');
        expect(existsSyncSpy).toHaveBeenCalledWith('./package.json_resolved');
    });
});
