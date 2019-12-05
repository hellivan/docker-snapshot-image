const startMock = jest.fn();
jest.mock('../lib', () => ({
    CliExectuor: {
        start: startMock
    }
}));

describe('docker-snapshot-image', () => {
    beforeEach(() => {
        startMock.mockRestore();
        jest.restoreAllMocks();
    });

    test('process should print error message and exit with 1 on error', async () => {
        const exitSpy = jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => undefined);

        startMock.mockImplementationOnce(() => Promise.reject(new Error('CustomErrorMessage')));
        await import('./docker-snapshot-image');

        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('There was an error: CustomErrorMessage');
    });
});
