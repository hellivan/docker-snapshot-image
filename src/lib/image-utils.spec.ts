const sanitizeImageNameMock = jest.fn().mockImplementation(v => v);
const sanitizeTagNameMock = jest.fn().mockImplementation(v => v);
const createOrTagMock = jest.fn();
const pushImageMock = jest.fn();
const getBranchNameMock = jest.fn();
const getCommitHashMock = jest.fn();
const getPackageInfoMock = jest.fn();
jest.mock('./docker-utils', () => ({
    createOrTag: createOrTagMock,
    pushImage: pushImageMock,
    sanitizeImageName: sanitizeImageNameMock,
    sanitizeTagName: sanitizeTagNameMock,
}));
jest.mock('./git-utils', () => ({
    getBranchName: getBranchNameMock,
    getCommitHash: getCommitHashMock,
}));
jest.mock('./npm-utils', () => ({
    NpmUtils: {
        getPackageInfo: getPackageInfoMock,
    },
}));

import { CreateImageOptions, getRegistryCredentials, ImageUtils, resolveImageName } from './image-utils';

describe('ImageUtils', () => {
    const defaultCreateImageOptions: CreateImageOptions = {
        autoTag: false,
        fixedTag: null,
        autoTagFormat: '{pkg-version}-{commit-hash}',
        imageName: null,
        silentDockerMode: false,
        testMode: false,
        push: false,
    };

    beforeEach(() => {
        sanitizeImageNameMock.mockClear();
        sanitizeTagNameMock.mockClear();
        createOrTagMock.mockRestore();
        pushImageMock.mockRestore();
        getBranchNameMock.mockRestore();
        getCommitHashMock.mockRestore();
        getPackageInfoMock.mockRestore();
        jest.restoreAllMocks();
    });

    test('createImage should not create or tag if autoTag is disabled and fixedTag is undefined', async () => {
        getPackageInfoMock.mockImplementationOnce(() => ({ name: 'test-okg-name', version: 42 }));
        await ImageUtils.createImage(defaultCreateImageOptions);

        expect(createOrTagMock).not.toHaveBeenCalled();
    });

    test('createImage should create auto-tagged image if option is set', async () => {
        const mockedHash = '1234fab';
        const mockedVersion = 42;
        const mockedName = 'test-pkg-name';
        const expectedTagName = `${mockedVersion}-${mockedHash}`;
        getCommitHashMock.mockImplementationOnce(() => Promise.resolve(mockedHash));
        getPackageInfoMock.mockImplementationOnce(() => Promise.resolve({ name: mockedName, version: mockedVersion }));

        createOrTagMock.mockImplementationOnce(() => Promise.resolve(expectedTagName));

        await ImageUtils.createImage({
            ...defaultCreateImageOptions,
            autoTag: true,
            testMode: true,
        });

        expect(sanitizeImageNameMock).toHaveBeenCalledWith(mockedName);
        expect(sanitizeTagNameMock).toHaveBeenCalledWith(expectedTagName);

        expect(createOrTagMock).toHaveBeenCalledWith(null, `${mockedName}:${expectedTagName}`, true, false);
    });

    test('createImage should create fixed tagged image if option is set', async () => {
        const mockedName = 'test-pkg-name';
        const fixedTag = 'fixed-test-tag';
        getPackageInfoMock.mockImplementationOnce(() => Promise.resolve({ name: mockedName }));

        createOrTagMock.mockImplementationOnce(() => Promise.resolve(fixedTag));

        await ImageUtils.createImage({
            ...defaultCreateImageOptions,
            fixedTag,
            silentDockerMode: true,
        });

        expect(sanitizeImageNameMock).toHaveBeenCalledWith(mockedName);

        expect(createOrTagMock).toHaveBeenCalledWith(null, `${mockedName}:${fixedTag}`, false, true);
    });

    test('createImage should create auto-tagged and fixed tagged image if options are set', async () => {
        const mockedHash = '1234fab';
        const mockedVersion = 42;
        const mockedName = 'test-pkg-name';
        const mockedBranchName = 'test-branch-name';
        const expectedAutoTagName = `${mockedVersion}-${mockedHash}-${mockedBranchName}`;
        const fixedTag = 'fixed-test-tag';
        getCommitHashMock.mockImplementationOnce(() => Promise.resolve(mockedHash));
        getBranchNameMock.mockImplementationOnce(() => Promise.resolve(mockedBranchName));
        getPackageInfoMock.mockImplementationOnce(() => Promise.resolve({ name: mockedName, version: mockedVersion }));

        createOrTagMock.mockImplementationOnce(() => Promise.resolve(expectedAutoTagName));

        await ImageUtils.createImage({
            ...defaultCreateImageOptions,
            fixedTag,
            autoTag: true,
            autoTagFormat: '{pkg-version}-{commit-hash}-{branch-name}',
        });

        expect(sanitizeImageNameMock).toHaveBeenCalledWith(mockedName);

        expect(createOrTagMock).toHaveBeenCalledTimes(2);

        expect(createOrTagMock).toHaveBeenNthCalledWith(1, null, `${mockedName}:${expectedAutoTagName}`, false, false);

        expect(createOrTagMock).toHaveBeenNthCalledWith(
            2,
            expectedAutoTagName,
            `${mockedName}:${fixedTag}`,
            false,
            false
        );
    });

    test('createImage should push if push is true', async () => {
        const mockedName = 'test-pkg-name';
        const fixedTag = 'fixed-test-tag';
        getPackageInfoMock.mockImplementationOnce(() => Promise.resolve({ name: mockedName }));

        createOrTagMock.mockImplementationOnce(() => Promise.resolve(fixedTag));

        await ImageUtils.createImage({
            ...defaultCreateImageOptions,
            fixedTag,
            silentDockerMode: true,
            push: true,
        });

        expect(sanitizeImageNameMock).toHaveBeenCalledWith(mockedName);

        expect(createOrTagMock).toHaveBeenCalledWith(null, `${mockedName}:${fixedTag}`, false, true);

        expect(pushImageMock).toHaveBeenCalledWith(`${mockedName}:${fixedTag}`, undefined);
    });

    test('createImage should not push if testMode is true', async () => {
        const mockedName = 'test-pkg-name';
        const fixedTag = 'fixed-test-tag';
        getPackageInfoMock.mockImplementationOnce(() => Promise.resolve({ name: mockedName }));

        createOrTagMock.mockImplementationOnce(() => Promise.resolve(fixedTag));

        await ImageUtils.createImage({
            ...defaultCreateImageOptions,
            fixedTag,
            silentDockerMode: true,
            push: true,
            testMode: true,
        });

        expect(sanitizeImageNameMock).toHaveBeenCalledWith(mockedName);

        expect(createOrTagMock).toHaveBeenCalledWith(null, `${mockedName}:${fixedTag}`, true, true);

        expect(pushImageMock).toHaveBeenCalledTimes(0);
    });
});

describe('getRegistryCredentials', () => {
    test('should return undefined if no ENV variable is provided', () => {
        const result = getRegistryCredentials({});
        expect(result).toBe(undefined);
    });

    test('should return undefined if password is not provided in ENV variable', () => {
        const result = getRegistryCredentials({
            CONTAINER_IMAGE_REGISTRY_USER: 'foo',
        });
        expect(result).toBe(undefined);
    });

    test('should return undefined if username is not provided in ENV variable', () => {
        const result = getRegistryCredentials({
            CONTAINER_IMAGE_REGISTRY_PASS: 'bar',
        });
        expect(result).toBe(undefined);
    });

    test('should return undefined if username is not provided in ENV variable', () => {
        const result = getRegistryCredentials({
            CONTAINER_IMAGE_REGISTRY_USER: 'foo',
            CONTAINER_IMAGE_REGISTRY_PASS: 'bar',
        });
        expect(result).toEqual({ username: 'foo', password: 'bar' });
    });
});

describe('resolveImageName', () => {
    test('should prepend registry repo if specified', () => {
        const result = resolveImageName({ CONTAINER_IMAGE_REGISTRY_REPO: 'some.repo.com/foo' }, 'image:1.2.3');
        expect(result).toEqual('some.repo.com/foo/image:1.2.3');
    });

    test('should not prepend registry repo if notspecified', () => {
        const result = resolveImageName({}, 'image:1.2.3');
        expect(result).toEqual('image:1.2.3');
    });
    test('should not add separation slash if repo already has one', () => {
        const result = resolveImageName({ CONTAINER_IMAGE_REGISTRY_REPO: 'some.repo.com/foo/' }, 'image:1.2.3');
        expect(result).toEqual('some.repo.com/foo/image:1.2.3');
    });
});
