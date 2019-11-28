import { existsSync as fileExistsSync } from 'fs';
import { resolve as resolvePath } from 'path';

import { JsonUtils } from './json-utils';

export class NpmUtils {
    public static async getPackageInfo(packageJsonFilePath: string): Promise<{ name: string; version: string }> {
        const pkgPath = resolvePath(packageJsonFilePath);

        if (!fileExistsSync(pkgPath)) {
            throw new Error(`Packageinfo file '${packageJsonFilePath}' not not found!`);
        }

        return JsonUtils.readJsonFile(pkgPath);
    }
}
