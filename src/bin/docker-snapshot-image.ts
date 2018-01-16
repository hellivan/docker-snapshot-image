#!/usr/bin/env node

const program = require('commander');
const pkg = require('../../package.json');
const {createImage} = require('../lib');

program.version(pkg.version)
    .option('--no-auto', 'Do not create the image with the automatic snapshot-tag ({pkg-version}-{commit-hash})')
    .option('-f --fixed-tag <name>', 'Additionally tag the image with the specified tag')
    .option('--image-name <name>', 'Use the specified custom name for the image')
    .option('-t --test', 'Start application in test mode (only log docker commands on stdout)')
    .option('--silent-docker', 'Do not output stdout/stderr from executed docker commands')
    .parse(process.argv);


const options = {
	imageName: program.imageName,
	fixedTag: program.fixedTag,
	autoTag: program.auto,
	testMode: program.test,
	silentDockerMode: program.silentDocker
};


createImage(options)
	.catch(err => {
		console.error(`There was an error: ${err.message}`);
		process.exit(1);
	});
