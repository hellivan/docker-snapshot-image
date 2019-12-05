const execCmdMock = jest.fn();
jest.mock('./cmd-utils', () => ({ execCmd: execCmdMock }));

import { getBranchName, getCommitHash } from './git-utils';

describe('git-utils', () => {
    describe('getBranchName', () => {
        beforeEach(() => {
            execCmdMock.mockRestore();
            jest.restoreAllMocks();
        });

        test('getBranchName should return BRANCH_NAME process env variable value if available', async () => {
            const branchName = await getBranchName({ BRANCH_NAME: 'test-name' });
            expect(branchName).toEqual('test-name');
        });

        test('getBranchName should execute git command if BRANCH_NAME process env variable is not available', async () => {
            execCmdMock.mockImplementation(() => Promise.resolve('test-git-name'));

            const branchName = await getBranchName({});
            expect(branchName).toEqual('test-git-name');
            expect(execCmdMock).toHaveBeenCalledWith('git rev-parse --abbrev-ref HEAD');
        });
    });

    describe('git-utils - getCommitHash', () => {
        beforeEach(() => {
            execCmdMock.mockRestore();
            jest.restoreAllMocks();
        });

        test('getCommitHash should execute git command and return result', async () => {
            execCmdMock.mockImplementation(() => Promise.resolve('test-git-hash'));

            const commitHash = await getCommitHash();
            expect(commitHash).toEqual('test-git-hash');
            expect(execCmdMock).toHaveBeenCalledWith('git rev-parse --short HEAD');
        });
    });
});
