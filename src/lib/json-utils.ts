import { FileUtils } from './file-utils';

export class JsonUtils {
    public static async readJsonFile<T>(filePath: string): Promise<T> {
        const fileContent = await FileUtils.readUtf8File(filePath);
        try {
            return JSON.parse(fileContent);
        } catch (err) {
            throw new Error(`Error while parsing json-file '${filePath}': "${(err as Error).message}"`);
        }
    }
}
