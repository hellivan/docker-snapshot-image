import { CliExectuor as exportedCliExectuor, ImageUtils as exportedImageUtils } from './index';
import { CliExectuor } from './cli-executor';
import { ImageUtils } from './image-utils';

describe('index', () => {
    test('index must export CliExectuor', () => {
        expect(exportedCliExectuor).toStrictEqual(CliExectuor);
    });

    test('index must export ImageUtils', () => {
        expect(exportedImageUtils).toStrictEqual(ImageUtils);
    });
});
