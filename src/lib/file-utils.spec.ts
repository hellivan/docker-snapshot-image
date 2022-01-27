const readFileMockFn = jest.fn();
jest.mock('fs', () => ({
    readFile: readFileMockFn,
}));
import { FileUtils } from './file-utils';

describe('file-utils', () => {
    beforeEach(() => {
        readFileMockFn.mockRestore();
        jest.restoreAllMocks();
    });

    test('readUtf8File should call fs.readFile with utf8 encoding option and return the result', async () => {
        const readFileSpy = readFileMockFn.mockImplementationOnce(
            (path: string, encoding: string, cbFn: (err: Error | null, data: string | null) => void) => {
                process.nextTick(() => cbFn(null, 'test-data'));
            }
        );
        const result = await FileUtils.readUtf8File('test-path');
        expect(result).toEqual('test-data');
        expect(readFileSpy).toHaveBeenCalledWith('test-path', 'utf8', expect.any(Function));
    });

    test('readUtf8File should reject if fs.readFile responds with an error', async () => {
        expect.assertions(2);
        const readFileError = new Error('Read file error');
        const readFileSpy = readFileMockFn.mockImplementationOnce(
            (path: string, encoding: string, cbFn: (err: Error | null, data: string | null) => void) => {
                process.nextTick(() => cbFn(readFileError, null));
            }
        );
        try {
            await FileUtils.readUtf8File('test-path');
        } catch (err) {
            expect(err).toStrictEqual(readFileError);
        }
        expect(readFileSpy).toHaveBeenCalledWith('test-path', 'utf8', expect.any(Function));
    });
});
