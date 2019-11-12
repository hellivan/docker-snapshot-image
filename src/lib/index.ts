import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

function execCmd(cmd: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve(stdout.trim());
        });
    });
}

function spawnCmd(command: string, args: string[], silent: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const cmd = spawn(command, args);
        cmd.stdout.on('data', data => !silent && process.stdout.write(`${data}`));
        cmd.stderr.on('data', data => !silent && process.stderr.write(`${data}`));

        cmd.on('error', err => reject(err));
        cmd.on('close', code => {
            if (code !== 0) {
                const errMsg = `Command '${command} ${args.join(' ')}' exited with status code ${code}'`;
                return reject(new Error(errMsg));
            }
            resolve();
        });
    });
}

async function getBranchName(): Promise<string> {
    return process.env['BRANCH_NAME'] || (await execCmd('git rev-parse --abbrev-ref HEAD'));
}

function getCommitHash(): Promise<string> {
    return execCmd('git rev-parse --short HEAD');
}

async function getPackageInfo(): Promise<{ name: string; version: string }> {
    const pkgPath = resolve('./package.json');

    if (!existsSync(pkgPath)) throw new Error('package.json not not found in cwd!');
    // TODO: replace require call
    return require(pkgPath);
}

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

function createOrTag(
    existingTag: string | null,
    newTag: string,
    testMode: boolean,
    silentDockerMode: boolean
): Promise<string> {
    if (!existingTag) return createDockerImage(newTag, testMode, silentDockerMode);
    return tagImage(existingTag, newTag, testMode, silentDockerMode);
}

// function sanitizeImageName(imageName: string): string {
//     return imageName.replace(/\//g, '-').replace(/\W/g, '');
// }

/**
 * Replace invalid characters with underscores
 *
 * @param tagName
 */
export function sanitizeTagName(tagName: string): string {
    return tagName
        // NOTE: replace any sla
        .replace(/[^A-Za-z0-9_-]/g, '_');
}

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

    // imageName = sanitizeImageName(imageName || info.name);
    imageName = imageName || info.name;

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
