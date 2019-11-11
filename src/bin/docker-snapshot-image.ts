#!/usr/bin/env node

import * as program from 'commander';

import { createImage, CreateImageOptions } from '../lib';

async function main(): Promise<void> {
    // TODO: replace require call
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../package.json');

    program
        .version(pkg.version)
        .option('--no-auto', 'Do not create the image with the automatic snapshot-tag useing auto-tag-format')
        .option(
            '--auto-tag-format <format>',
            'Available options are {branch-name}, {pkg-version} and {commit-hash}',
            '{pkg-version}-{commit-hash}'
        )
        .option('-f --fixed-tag <name>', 'Additionally tag the image with the specified tag')
        .option('--image-name <name>', 'Use the specified custom name for the image')
        .option('-t --test', 'Start application in test mode (only log docker commands on stdout)')
        .option('--silent-docker', 'Do not output stdout/stderr from executed docker commands')
        .parse(process.argv);

    const options: CreateImageOptions = {
        imageName: program.imageName,
        fixedTag: program.fixedTag,
        autoTag: program.auto,
        testMode: program.test,
        silentDockerMode: program.silentDocker,
        autoTagFormat: program.autoTagFormat
    };

    await createImage(options);
}

main().catch((err: Error) => {
    console.error(`There was an error: ${err.message}`);
    process.exit(1);
});
