import { existsSync as fileExistsSync } from 'fs';
import { resolve as resolvePath } from 'path';

export async function getPackageInfo(): Promise<{ name: string; version: string }> {
    const pkgPath = resolvePath('./package.json');

    if (!fileExistsSync(pkgPath)) throw new Error('package.json not not found in cwd!');
    // TODO: replace require call
    return require(pkgPath);
}