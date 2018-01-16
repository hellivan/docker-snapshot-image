const {existsSync} = require('fs');
const {exec, spawn} = require('child_process');
const {resolve} = require('path');


function execCmd(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
            if(err) return reject(err);
            resolve(stdout.trim());
        });
    });
}

function spawnCmd(command, args, silent) {
    return new Promise((resolve, reject) => {
        const cmd = spawn(command, args);
        cmd.stdout.on('data', (data) => !silent && process.stdout.write(`${data}`));
        cmd.stderr.on('data', (data) => !silent && process.stderr.write(`${data}`));

        cmd.on('error', (err) => reject(err));
        cmd.on('close', (code) => {
            if(code !== 0) {
                const errMsg = `Command '${command} ${args.join(' ')}' exited with status code ${code}'`;
                return reject(new Error(errMsg));
            }
            resolve();
        });
    });
}

function getCommitHash() {
    return execCmd('git rev-parse --short HEAD');
}

function getPackageInfo() {
    const pkgPath = resolve('./package.json');

    return Promise.resolve()
        .then(() => {
            if(!existsSync(pkgPath)) throw new Error('package.json not not found in cwd!');
            return require(pkgPath);
        });
}

function _createImage(tag, testMode, silentDockerMode) {
    const command = 'docker';
    const args = ['build', '--force-rm', '-t', tag, './'];
    return Promise.resolve()
        .then(() => console.log(`Creating image using command '${command} ${args.join(' ')}'`))
        .then(() => !testMode && spawnCmd(command, args, silentDockerMode))
        .then(() => tag);
}

function tagImage(existingTag, newTag, testMode, silentDockerMode) {
    const command = 'docker';
    const args = ['tag', existingTag, newTag];
    return Promise.resolve()
        .then(() => console.log(`Tagging image using command '${command} ${args.join(' ')}'`))
        .then(() => !testMode && spawnCmd(command, args, silentDockerMode))
        .then(() => existingTag);
}

function createOrTag(existingTag, newTag, testMode, silentDockerMode) {
    if(!existingTag) return _createImage(newTag, testMode, silentDockerMode);
    return tagImage(existingTag, newTag, testMode, silentDockerMode);
}

function sanitizeImageName(imageName) {
    return imageName.replace(/\//g, '-').replace(/\W/g, '');
}

export function createImage({imageName, fixedTag, autoTag, testMode, silentDockerMode}) {
    return Promise.all([
            getCommitHash(),
            getPackageInfo()
        ])
        .then(([commitHash, info]) => {
            let p = Promise.resolve();

            imageName = sanitizeImageName(imageName || info.name);
            let defaultTag = `${info.version}-${commitHash}`;

            if(autoTag) {
                p = p.then((dockerImage) =>
                    createOrTag(dockerImage, `${imageName}:${defaultTag}`, testMode, silentDockerMode)
                );
            }

            if(fixedTag) {
                p = p.then((dockerImage) =>
                    createOrTag(dockerImage, `${imageName}:${fixedTag}`, testMode, silentDockerMode)
                );
            }

            return p;
        });
};
