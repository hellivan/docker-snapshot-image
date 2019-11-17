import { execCmd } from './cmd-utils';

export async function getBranchName(): Promise<string> {
    return process.env['BRANCH_NAME'] || execCmd('git rev-parse --abbrev-ref HEAD');
}

export function getCommitHash(): Promise<string> {
    return execCmd('git rev-parse --short HEAD');
}
