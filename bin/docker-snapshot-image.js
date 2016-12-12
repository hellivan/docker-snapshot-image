#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');
const {createImage} = require('../lib');

program.version(pkg.version)
    .option('--no-auto', 'Do not create the image with the snapshot-tag')
    .option('-f --fixed-tag <name>', 'Tag the image with the specified tag')
    .option('--image-name <name>', 'Use the specified custom name for the image')
    .parse(process.argv);


const options = {
	imageName: program.imageName,
	fixedTag: program.fixedTag,
	autoTag: program.auto
};


createImage(options)
	.catch(err => {
		console.error(`There was an error: ${err.message}`);
		process.exit(1);
	});
