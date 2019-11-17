import { execCmd } from './cmd-utils';

export async function getBranchName(processEnv: { [key: string]: string | undefined }): Promise<string> {
    return processEnv['BRANCH_NAME'] || execCmd('git rev-parse --abbrev-ref HEAD');
}

export function getCommitHash(): Promise<string> {
    return execCmd('git rev-parse --short HEAD');
}
