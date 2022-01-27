const createImageMock = jest.fn();
const getPackageInfoMock = jest.fn();
jest.mock('./image-utils', () => ({
    ImageUtils: {
        createImage: createImageMock,
    },
}));
jest.mock('./npm-utils', () => ({
    NpmUtils: {
        getPackageInfo: getPackageInfoMock,
    },
}));
import { join as joinPath } from 'path';

import { CliExectuor } from './cli-executor';

describe('CliExectuor', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('CliExectuor should call createImage with default options if no processArgv are provided', async () => {
        getPackageInfoMock.mockImplementationOnce(() => Promise.resolve({ name: 'test-anme', version: 42 }));
        createImageMock.mockImplementationOnce(() => Promise.resolve());

        await CliExectuor.start(['/path/to/node', '/path/to/js-script']);
        expect(createImageMock).toHaveBeenCalledWith({
            imageName: null,
            fixedTag: null,
            autoTag: true,
            testMode: false,
            silentDockerMode: false,
            autoTagFormat: '{pkg-version}-{commit-hash}',
        });

        expect(getPackageInfoMock).toHaveBeenCalledWith(joinPath(__dirname, '..', '..', 'package.json'));
    });
});
