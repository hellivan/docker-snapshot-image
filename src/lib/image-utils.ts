import { BasicCredentials } from './credentials';
import { createOrTag, pushImage, sanitizeImageName, sanitizeTagName } from './docker-utils';
import { getBranchName, getCommitHash } from './git-utils';
import { NpmUtils } from './npm-utils';

export interface CreateImageOptions {
    imageName: string | null;
    fixedTag: string | null;
    autoTag: boolean;
    testMode: boolean;
    silentDockerMode: boolean;
    autoTagFormat: string;
    push: boolean;
}

export function getRegistryCredentials(env: Record<string, string | undefined>): BasicCredentials | undefined {
    const username = env['CONTAINER_IMAGE_REGISTRY_USER'];
    const password = env['CONTAINER_IMAGE_REGISTRY_PASS'];
    if (username == null || password == null) return undefined;
    return { username, password };
}

export function resolveImageName(env: Record<string, string | undefined>, imageName: string): string {
    const registryRepo = env['CONTAINER_IMAGE_REGISTRY_REPO'];
    if (registryRepo == null) return imageName;
    return `${registryRepo}${registryRepo.endsWith('/') ? '' : '/'}${imageName}`;
}

export class ImageUtils {
    public static async createImage({
        imageName,
        fixedTag,
        autoTag,
        testMode,
        silentDockerMode,
        autoTagFormat,
        push,
    }: CreateImageOptions): Promise<string[]> {
        const packageInfo = await NpmUtils.getPackageInfo('./package.json');

        imageName = sanitizeImageName(imageName || packageInfo.name);

        imageName = resolveImageName(process.env, imageName);

        let latestDockerImageTag: string | null = null;
        const dockerImageTags: string[] = [];

        if (autoTag) {
            const [commitHash, branchName] = await Promise.all([getCommitHash(), getBranchName(process.env)]);

            const defaultTag = autoTagFormat
                .replace('{pkg-version}', packageInfo.version)
                .replace('{commit-hash}', commitHash)
                .replace('{branch-name}', branchName);

            const sanitizedDefaultTag = sanitizeTagName(defaultTag);

            latestDockerImageTag = await createOrTag(
                latestDockerImageTag,
                `${imageName}:${sanitizedDefaultTag}`,
                testMode,
                silentDockerMode
            );

            dockerImageTags.push(`${imageName}:${sanitizedDefaultTag}`);
        }

        if (fixedTag) {
            latestDockerImageTag = await createOrTag(
                latestDockerImageTag,
                `${imageName}:${fixedTag}`,
                testMode,
                silentDockerMode
            );
            dockerImageTags.push(`${imageName}:${fixedTag}`);
        }

        if (push) {
            const registryCredentials = getRegistryCredentials(process.env);
            for (const dockerImageTag of dockerImageTags) {
                console.log(`Pushing image "${dockerImageTag}"`);
                if (!testMode) {
                    await pushImage(dockerImageTag, registryCredentials);
                }
            }
        }

        return dockerImageTags;
    }
}
