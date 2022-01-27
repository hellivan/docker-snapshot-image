const execMock = jest.fn();
const spawnMock = jest.fn();
jest.mock('child_process', () => ({
    exec: execMock,
    spawn: spawnMock,
}));

import { execCmd, spawnCmd } from './cmd-utils';
import { EventEmitter } from 'events';

class SpawnedCommandMock extends EventEmitter {
    public readonly stdout = new EventEmitter();
    public readonly stderr = new EventEmitter();
}

type ExecMockCbFn = (err: Error | null, stdout: string | null, stderr: string | null) => void;

describe('execCmd', () => {
    beforeEach(() => {
        execMock.mockRestore();
        spawnMock.mockRestore();
        jest.restoreAllMocks();
    });

    test('execCmd should execute a command and return the output as a string', async () => {
        execMock.mockImplementationOnce((cmd: string, cbFn: ExecMockCbFn) => {
            process.nextTick(() => cbFn(null, 'test-output', null));
        });

        const result = await execCmd('test-bin');

        expect(execMock).toHaveBeenCalledWith('test-bin', expect.any(Function));
        expect(result).toEqual('test-output');
    });

    test('execCmd result should be trimmed', async () => {
        execMock.mockImplementationOnce((cmd: string, cbFn: ExecMockCbFn) => {
            process.nextTick(() => cbFn(null, ' test-output ', null));
        });

        const result = await execCmd('test-bin');

        expect(result).toEqual('test-output');
    });

    test('execCmd should reject if exec fails', async () => {
        expect.assertions(1);
        const execError = new Error('custom error');
        execMock.mockImplementationOnce((cmd: string, cbFn: ExecMockCbFn) => {
            process.nextTick(() => cbFn(execError, null, null));
        });

        try {
            await execCmd('test-bin');
        } catch (err) {
            expect(err).toStrictEqual(execError);
        }
    });
});

describe('spawnCmd', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('spawnCmd should spawn command with parameters and resolve on exit code 0', async () => {
        const cmdMock = new SpawnedCommandMock();
        spawnMock.mockImplementationOnce(() => cmdMock);

        const resultPromise = spawnCmd('test-bin', ['param1', 'param2'], true);

        cmdMock.emit('close', 0);

        await resultPromise;

        expect(spawnMock).toHaveBeenCalledWith('test-bin', ['param1', 'param2']);
    });

    test('spawnCmd should spawn command and forward stdout/stderr', async () => {
        const cmdMock = new SpawnedCommandMock();
        spawnMock.mockImplementationOnce(() => cmdMock);

        const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementationOnce(() => true);
        const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementationOnce(() => true);

        const resultPromise = spawnCmd('test-bin', [], false);

        cmdMock.stdout.emit('data', 'TestStdoutData');
        cmdMock.stderr.emit('data', 'TestStderrData');

        cmdMock.emit('close', 0);

        await resultPromise;

        expect(stdoutSpy).toHaveBeenCalledWith('TestStdoutData');
        expect(stderrSpy).toHaveBeenCalledWith('TestStderrData');
    });

    test('spawnCmd should spawn command without forwarding stdout/stderr in silent mode', async () => {
        const cmdMock = new SpawnedCommandMock();
        spawnMock.mockImplementationOnce(() => cmdMock);

        const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementationOnce(() => true);
        const stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementationOnce(() => true);

        const resultPromise = spawnCmd('test-bin', [], true);

        cmdMock.stdout.emit('data', 'TestStdoutData');
        cmdMock.stderr.emit('data', 'TestStderrData');

        cmdMock.emit('close', 0);

        await resultPromise;

        expect(stdoutSpy).not.toHaveBeenCalled();
        expect(stderrSpy).not.toHaveBeenCalled();
    });

    test('spawnCmd should reject for result codes !== 0', async () => {
        expect.assertions(1);

        const cmdMock = new SpawnedCommandMock();
        spawnMock.mockImplementationOnce(() => cmdMock);

        const resultPromise = spawnCmd('test-bin', ['param1', 'param2'], true);

        cmdMock.emit('close', 1);

        try {
            await resultPromise;
        } catch (err) {
            expect((err as Error).message).toEqual(`Command 'test-bin param1 param2' exited with status code 1`);
        }
    });

    test('spawnCmd should reject on spawn errors', async () => {
        expect.assertions(1);

        const spawnError = new Error('custom error');

        const cmdMock = new SpawnedCommandMock();
        spawnMock.mockImplementationOnce(() => cmdMock);

        const resultPromise = spawnCmd('test-bin', [], true);

        cmdMock.emit('error', spawnError);

        try {
            await resultPromise;
        } catch (err) {
            expect(err).toStrictEqual(spawnError);
        }
    });
});
