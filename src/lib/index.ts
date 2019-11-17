import {createOrTag, sanitizeImageName, sanitizeTagName} from './docker-utils';
import {getBranchName, getCommitHash} from './git-utils';
import {getPackageInfo} from './npm-utils';

export interface CreateImageOptions {
    imageName: string;
    fixedTag: string;
    autoTag: boolean;
    testMode: boolean;
    silentDockerMode: boolean;
    autoTagFormat: string;
}

export async function createImage({
    imageName,
    fixedTag,
    autoTag,
    testMode,
    silentDockerMode,
    autoTagFormat
}: CreateImageOptions): Promise<string | null> {
    const [commitHash, info, branchName] = await Promise.all([getCommitHash(), getPackageInfo(), getBranchName()]);

    imageName = sanitizeImageName(imageName || info.name);

    const defaultTag = autoTagFormat
        .replace('{pkg-version}', info.version)
        .replace('{commit-hash}', commitHash)
        .replace('{branch-name}', branchName);

    const sanitizedDefaultTag = sanitizeTagName(defaultTag);

    let dockerImage: string | null = null;

    if (autoTag) {
        dockerImage = await createOrTag(dockerImage, `${imageName}:${sanitizedDefaultTag}`, testMode, silentDockerMode);
    }

    if (fixedTag) {
        dockerImage = await createOrTag(dockerImage, `${imageName}:${fixedTag}`, testMode, silentDockerMode);
    }

    return dockerImage;
}
