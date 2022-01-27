import { Command } from 'commander';
import { join as joinPath } from 'path';

import { CommanderUtils } from './commander-utils';
import { CreateImageOptions, ImageUtils } from './image-utils';
import { NpmUtils } from './npm-utils';

export class CliExectuor {
    public static async start(processArgv: string[]): Promise<void> {
        const pkgInfo = await NpmUtils.getPackageInfo(joinPath(__dirname, '..', '..', 'package.json'));

        const defaultAutoTagFormat = '{pkg-version}-{commit-hash}';

        const program = new Command(pkgInfo.name);

        program.version(pkgInfo.version);

        program
            .option('--no-auto', 'Do not create the image with the automatic snapshot-tag specified in auto-tag-format')
            .option(
                '--auto-tag-format <format>',
                'Available options are {branch-name}, {pkg-version} and {commit-hash}',
                defaultAutoTagFormat
            )
            .option('-f --fixed-tag <name>', 'Additionally tag the image with the specified tag')
            .option('--image-name <name>', 'Use the specified custom name for the image')
            .option('-t --test', 'Start application in test mode (only log docker commands on stdout)')
            .option('--silent-docker', 'Do not output stdout/stderr from executed docker commands')
            .option('-p --push', 'Push the images to a remote registry')
            .parse(processArgv);

        const programOptions = program.opts();

        const options: CreateImageOptions = {
            imageName: CommanderUtils.parseStringValue(programOptions.imageName),
            fixedTag: CommanderUtils.parseStringValue(programOptions.fixedTag),
            autoTag: CommanderUtils.parseBooleanValue(programOptions.auto, true),
            testMode: CommanderUtils.parseBooleanValue(programOptions.test, false),
            silentDockerMode: CommanderUtils.parseBooleanValue(programOptions.silentDocker, false),
            autoTagFormat: CommanderUtils.parseStringValue(programOptions.autoTagFormat, defaultAutoTagFormat),
            push: CommanderUtils.parseBooleanValue(programOptions.push, false),
        };

        await ImageUtils.createImage(options);
    }
}
