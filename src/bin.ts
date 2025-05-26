#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { resolveArgsFromArgv } from './utils/runner/resolve-args';
import { run } from './utils/runner/runner';

const argv = process.argv.slice(2);

const rawTargetFilePath = argv.shift();

if (!rawTargetFilePath) {
    console.error('No file name or options provided');
    process.exit(1);
}

// Normalize and resolve the path for cross-platform compatibility
const targetFilePath = path.resolve(path.normalize(rawTargetFilePath));

// Optionally check if the file exists before spawning
if (fs.existsSync(targetFilePath)) {
    const child = spawn('npx', ['tsx', targetFilePath, ...argv], {
        stdio: 'inherit',
        shell: true, // Windows compatibility
    });

    child.on('exit', (code) => {
        process.exit(code ?? 0);
    });
} else if (argv.includes('-o')) {
    const options = resolveArgsFromArgv();

    if (!options) {
        console.error(`File not found: ${targetFilePath}`);
        process.exit(1);
    }

    run(options);
}
