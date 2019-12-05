#!/usr/bin/env node

import { CliExectuor } from '../lib';

CliExectuor.start(process.argv).catch((err: Error) => {
    console.error(`There was an error: ${err.message}`);
    process.exit(1);
});
