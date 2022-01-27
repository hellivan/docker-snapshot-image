import { createOrTag, sanitizeImageName, sanitizeTagName } from './docker-utils';
import { getBranchName, getCommitHash } from './git-utils';
import { NpmUtils } from './npm-utils';

export interface CreateImageOptions {
    imageName: string | null;
    fixedTag: string | null;
    autoTag: boolean;
    testMode: boolean;
    silentDockerMode: boolean;
    autoTagFormat: string;
}

export class ImageUtils {
    public static async createImage({
        imageName,
        fixedTag,
        autoTag,
        testMode,
        silentDockerMode,
        autoTagFormat,
    }: CreateImageOptions): Promise<string | null> {
        const packageInfo = await NpmUtils.getPackageInfo('./package.json');

        imageName = sanitizeImageName(imageName || packageInfo.name);

        let dockerImageTag: string | null = null;

        if (autoTag) {
            const [commitHash, branchName] = await Promise.all([getCommitHash(), getBranchName(process.env)]);

            const defaultTag = autoTagFormat
                .replace('{pkg-version}', packageInfo.version)
                .replace('{commit-hash}', commitHash)
                .replace('{branch-name}', branchName);

            const sanitizedDefaultTag = sanitizeTagName(defaultTag);

            dockerImageTag = await createOrTag(
                dockerImageTag,
                `${imageName}:${sanitizedDefaultTag}`,
                testMode,
                silentDockerMode
            );
        }

        if (fixedTag) {
            dockerImageTag = await createOrTag(dockerImageTag, `${imageName}:${fixedTag}`, testMode, silentDockerMode);
        }

        return dockerImageTag;
    }
}
