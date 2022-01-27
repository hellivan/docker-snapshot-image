import axios from 'axios';
import * as nock from 'nock';

const spawnCmdMockFn = jest.fn();
jest.mock('./cmd-utils', () => ({
    spawnCmd: spawnCmdMockFn,
}));
import { createOrTag, pushImage, sanitizeImageName, sanitizeTagName } from './docker-utils';

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

describe('pushImage', () => {
    const dockerApiNock = nock('http://localhost/v1.41');

    beforeEach(() => {
        jest.restoreAllMocks();
        nock.cleanAll();
    });

    afterEach(() => {
        dockerApiNock.done();
    });

    test('should create a client on /var/run/docker.sock', async () => {
        const createSpy = jest.spyOn(axios, 'create');

        const dockerImageWithTag = 'some.registry.com/repo/image:1.2.3';

        dockerApiNock.post(`/images/${dockerImageWithTag}/push`).reply(
            200,
            `{"status":"1.2.3: digest: sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6 size: 2200"}
{"progressDetail":{},"aux":{"Tag":"1.2.3","Digest":"sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6","Size":2200}}`
        );

        await pushImage(dockerImageWithTag, undefined);

        expect(createSpy).toHaveBeenCalledTimes(1);
        expect(createSpy).toHaveBeenCalledWith({ socketPath: '/var/run/docker.sock', timeout: 10 * 60 * 1000 });
    });

    test('should send a push request to docker api without credentials if not specified', async () => {
        const dockerImageWithTag = 'some.registry.com/repo/image:1.2.3';

        dockerApiNock.post(`/images/${dockerImageWithTag}/push`, {}, { badheaders: ['X-Registry-Auth'] }).reply(
            200,
            `{"status":"1.2.3: digest: sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6 size: 2200"}
{"progressDetail":{},"aux":{"Tag":"1.2.3","Digest":"sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6","Size":2200}}`
        );

        await pushImage(dockerImageWithTag, undefined);
    });

    test('should send a push request to docker api with credentials if specified', async () => {
        const dockerImageWithTag = 'some.registry.com/repo/image:1.2.3';

        dockerApiNock
            .post(
                `/images/${dockerImageWithTag}/push`,
                {},
                {
                    reqheaders: { 'X-Registry-Auth': 'eyJ1c2VybmFtZSI6ImZvbyIsInBhc3N3b3JkIjoiYmFyIn0=' },
                }
            )
            .reply(
                200,
                `{"status":"1.2.3: digest: sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6 size: 2200"}
{"progressDetail":{},"aux":{"Tag":"1.2.3","Digest":"sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6","Size":2200}}`
            );

        await pushImage(dockerImageWithTag, { username: 'foo', password: 'bar' });
    });

    test('should throw an error if response contains an error', async () => {
        const dockerImageWithTag = 'some.registry.com/repo/image:1.2.3';

        dockerApiNock
            .post(
                `/images/${dockerImageWithTag}/push`,
                {},
                {
                    reqheaders: { 'X-Registry-Auth': 'eyJ1c2VybmFtZSI6ImZvbyIsInBhc3N3b3JkIjoiYmFyIn0=' },
                }
            )
            .reply(
                200,
                `{"status":"1.2.3: digest: sha256:17cdfd262dd5ed022949f33c54bdfc006d46799e2e2840022ef0798d58e374f6 size: 2200"}
{"errorDetail":{"message":"denied: requested access to the resource is denied"},"error":"denied: requested access to the resource is denied"}`
            );

        await expect(pushImage(dockerImageWithTag, { username: 'foo', password: 'bar' })).rejects.toMatchObject({
            message: `Error while pushing image "some.registry.com/repo/image:1.2.3": "denied: requested access to the resource is denied"`,
        });
    });
});
