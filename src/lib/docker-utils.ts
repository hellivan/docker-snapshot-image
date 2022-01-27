import axios from 'axios';

import { spawnCmd } from './cmd-utils';
import { BasicCredentials } from './credentials';

async function createDockerImage(tag: string, testMode: boolean, silentDockerMode: boolean): Promise<string> {
    const command = 'docker';
    const args = ['build', '--force-rm', '-t', tag, './'];
    console.log(`Creating image using command '${command} ${args.join(' ')}'`);
    if (!testMode) {
        await spawnCmd(command, args, silentDockerMode);
    }
    return tag;
}

async function tagImage(
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

// curl -XGET --unix-socket /var/run/docker.sock http://localhost/images/json
// curl -i -XPOST -H "X-Registry-Auth: Base64({"username": "foo", "password": "bar"})" --unix-socket /var/run/docker.sock http://localhost/images/docker.solunio.com/common/hitower-service.data-producer:7.0.4/push
export async function pushImage(existingTag: string, credentials: BasicCredentials | undefined): Promise<void> {
    const headers = credentials != null ? { 'X-Registry-Auth': encodeRegistryAuth(credentials) } : undefined;
    const result = await axios
        .create({ socketPath: '/var/run/docker.sock', timeout: 10 * 60 * 1000 })
        .post<string>(`http://localhost/v1.41/images/${existingTag}/push`, {}, { headers });

    for (const line of result.data.split('\n')) {
        // skip empty lines
        if (line.trim().length > 0) {
            const parsed = JSON.parse(line);
            if (parsed.error != null) {
                throw new Error(`Error while pushing image "${existingTag}": "${parsed.error}"`);
            }
        }
    }

    console.log(`Pushed image "${existingTag}"`);
}

interface DockerRegistryAuthData {
    readonly username: string;
    readonly password: string;
}

function encodeRegistryAuth(credentials: BasicCredentials): string {
    const dockerRegistryAuthData: DockerRegistryAuthData = credentials;
    return Buffer.from(JSON.stringify(dockerRegistryAuthData)).toString('base64');
}
