import { readFile as fsReadFile } from 'fs';

export class FileUtils {
    public static async readUtf8File(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fsReadFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
                if (err) return reject(err);
                return resolve(data);
            });
        });
    }

    public static async readJsonFile<T>(filePath: string): Promise<T> {
        const fileContent = await FileUtils.readUtf8File(filePath);
        try {
            return JSON.parse(fileContent);
        } catch (err) {
            throw new Error(`Error while parsing json-file ${filePath}: ${err.message}`);
        }
    }
}
