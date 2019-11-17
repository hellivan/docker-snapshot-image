import { spawnCmd } from './cmd-utils';

export async function createDockerImage(tag: string, testMode: boolean, silentDockerMode: boolean): Promise<string> {
    const command = 'docker';
    const args = ['build', '--force-rm', '-t', tag, './'];
    console.log(`Creating image using command '${command} ${args.join(' ')}'`);
    if (!testMode) {
        await spawnCmd(command, args, silentDockerMode);
    }
    return tag;
}

export async function tagImage(
    existingTag: string,
    newTag: string,
    testMode: boolean,
    silentDockerMode: boolean
): Promise<string> {
    const command = 'docker';
    const args = ['tag', existingTag, newTag];
    console.log(`Tagging image using command '${command} ${args.join(' ')}'`);
    if (!testMode) {
        await spawnCmd(command, args, silentDockerMode);
    }
    return existingTag;
}

export function createOrTag(
    existingTag: string | null,
    newTag: string,
    testMode: boolean,
    silentDockerMode: boolean
): Promise<string> {
    if (!existingTag) return createDockerImage(newTag, testMode, silentDockerMode);
    return tagImage(existingTag, newTag, testMode, silentDockerMode);
}

/**
 * Replace invalid characters with underscore and minus
 *
 * @param tagName
 */
export function sanitizeTagName(tagName: string): string {
    return tagName.replace(/[/\\]/g, '-').replace(/[^A-Za-z0-9_\-\.]/g, '_');
}

/**
 * Replace invalid characters with underscore and minus
 *
 * @param imageName
 */
export function sanitizeImageName(imageName: string): string {
    return imageName.replace(/[/\\]/g, '-').replace(/[^A-Za-z0-9_\-\.]/g, '_');
}