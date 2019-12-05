import { exec, spawn } from 'child_process';

export function execCmd(cmd: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(err);
            resolve(stdout.trim());
        });
    });
}

export function spawnCmd(command: string, args: string[], silent: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const cmd = spawn(command, args);

        // TODO: unregister event listeners to prevent leaks

        cmd.stdout.on('data', data => !silent && process.stdout.write(`${data}`));
        cmd.stderr.on('data', data => !silent && process.stderr.write(`${data}`));

        cmd.on('error', err => reject(err));
        cmd.on('close', code => {
            if (code !== 0) {
                const errMsg = `Command '${command} ${args.join(' ')}' exited with status code ${code}`;
                return reject(new Error(errMsg));
            }
            resolve();
        });
    });
}
