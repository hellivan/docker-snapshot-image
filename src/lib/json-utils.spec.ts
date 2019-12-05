const readUtf8FileMockFn = jest.fn();
jest.mock('./file-utils', () => ({
    FileUtils: {
        readUtf8File: readUtf8FileMockFn
    }
}));
import { JsonUtils } from './json-utils';

describe('json-utils', () => {
    beforeEach(() => {
        readUtf8FileMockFn.mockRestore();
        jest.restoreAllMocks();
    });

    test('readJsonFile should read file using readUtf8File function parse the content as json', async () => {
        const readUtf8FileSpy = readUtf8FileMockFn.mockImplementationOnce(() => '{"foo": "bar", "test": 1}');
        const result = await JsonUtils.readJsonFile('test-path');
        expect(result).toEqual({ foo: 'bar', test: 1 });
        expect(readUtf8FileSpy).toHaveBeenCalledWith('test-path');
    });

    test('readJsonFile should reject if json parsing fails', async () => {
        expect.assertions(1);
        readUtf8FileMockFn.mockImplementationOnce(() => 'invalidJsonString');
        try {
            await JsonUtils.readJsonFile('test-path');
        } catch (err) {
            expect(err.message).toEqual(
                `Error while parsing json-file 'test-path': "Unexpected token i in JSON at position 0"`
            );
        }
    });
});
