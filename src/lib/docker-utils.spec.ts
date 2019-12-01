const spawnCmdMockFn = jest.fn();
jest.mock('./cmd-utils', () => ({
    spawnCmd: spawnCmdMockFn
}));
import { createOrTag, sanitizeImageName, sanitizeTagName } from './docker-utils';

describe('sanitizeTagName', () => {
    test('sanitizeTagName should replace white-spaces with underscore', () => {
        expect(sanitizeTagName('foo bar tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should replace : with underscore', () => {
        expect(sanitizeTagName('foo:bar:tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should replace / with minus', () => {
        expect(sanitizeTagName('foo/bar/tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeTagName should replace \\ with minus', () => {
        expect(sanitizeTagName('foo\\bar\\tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeTagName should not replace underscores', () => {
        expect(sanitizeTagName('foo_bar_tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeTagName should not replace minus', () => {
        expect(sanitizeTagName('foo-bar-tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeTagName should not replace numbers', () => {
        expect(sanitizeTagName('foo-bar-10')).toEqual('foo-bar-10');
    });

    test('sanitizeTagName should not replace dots', () => {
        expect(sanitizeTagName('foo.bar.tag')).toEqual('foo.bar.tag');
    });
});

describe('sanitizeImageName', () => {
    test('sanitizeImageName should replace white-spaces with underscore', () => {
        expect(sanitizeImageName('foo bar tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeImageName should replace : with underscore', () => {
        expect(sanitizeImageName('foo:bar:tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeImageName should replace / with minus', () => {
        expect(sanitizeImageName('foo/bar/tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeImageName should replace \\ with minus', () => {
        expect(sanitizeImageName('foo\\bar\\tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeImageName should not replace underscores', () => {
        expect(sanitizeImageName('foo_bar_tag')).toEqual('foo_bar_tag');
    });

    test('sanitizeImageName should not replace minus', () => {
        expect(sanitizeImageName('foo-bar-tag')).toEqual('foo-bar-tag');
    });

    test('sanitizeImageName should not replace numbers', () => {
        expect(sanitizeImageName('foo-bar-10')).toEqual('foo-bar-10');
    });

    test('sanitizeImageName should not replace dots', () => {
        expect(sanitizeImageName('foo.bar.tag')).toEqual('foo.bar.tag');
    });
});

describe('createOrTag', () => {
    beforeEach(() => {
        spawnCmdMockFn.mockRestore();
        jest.restoreAllMocks();
    });

    test('createOrTag shoud spawn docker create command if no existing tag is passed', async () => {
        const spawnCmdSpy = spawnCmdMockFn.mockImplementationOnce(() => Promise.resolve());
        await createOrTag(null, 'new-tag', false, false);
        expect(spawnCmdSpy).toHaveBeenCalledWith('docker', ['build', '--force-rm', '-t', 'new-tag', './'], false);
    });

    test('createOrTag shoud return tag if no existing tag is passed', async () => {
        spawnCmdMockFn.mockImplementationOnce(() => Promise.resolve());
        const tag = await createOrTag(null, 'new-tag', false, false);
        expect(tag).toEqual('new-tag');
    });

    test('createOrTag shoud not call spawnCmd in testMode', async () => {
        const spawnCmdSpy = spawnCmdMockFn.mockImplementationOnce(() => Promise.resolve());
        const tag = await createOrTag(null, 'new-tag', true, false);
        expect(spawnCmdSpy).not.toHaveBeenCalled();
        expect(tag).toEqual('new-tag');
    });

    test('createOrTag shoud spawn docker tag command if existing tag is passed', async () => {
        const spawnCmdSpy = spawnCmdMockFn.mockImplementationOnce(() => Promise.resolve());
        await createOrTag('existing-tag', 'new-tag', false, false);
        expect(spawnCmdSpy).toHaveBeenCalledWith('docker', ['tag', 'existing-tag', 'new-tag'], false);
    });

    test('createOrTag shoud return passed in existing tag', async () => {
        spawnCmdMockFn.mockImplementationOnce(() => Promise.resolve());
        const tag = await createOrTag('existing-tag', 'new-tag', false, false);
        expect(tag).toEqual('existing-tag');
    });

    test('createOrTag shoud not call spawnCmd in testMode', async () => {
        const spawnCmdSpy = spawnCmdMockFn.mockImplementationOnce(() => Promise.resolve());
        const tag = await createOrTag('existing-tag', 'new-tag', true, false);
        expect(spawnCmdSpy).not.toHaveBeenCalled();
        expect(tag).toEqual('existing-tag');
    });
});
