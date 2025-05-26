#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { resolveArgsFromArgv } from './utils/runner/resolve-args.js';

const argv = process.argv.slice(2);

const rawTargetFilePath = argv[0];

const actualProvidedFilePath = (() => {
    if (rawTargetFilePath === '-o') {
        return null;
    }

    if (!rawTargetFilePath) {
        return null;
    }

    // Normalize and resolve the path for cross-platform compatibility
    const targetFilePath = path.resolve(path.normalize(rawTargetFilePath));

    if (fs.existsSync(targetFilePath)) return targetFilePath;
})();

// Optionally check if the file exists before spawning
if (actualProvidedFilePath) {
    const child = spawn('npx', ['tsx', actualProvidedFilePath, ...argv.slice(1)], {
        stdio: 'inherit',
        shell: true, // Windows compatibility
    });

    child.on('exit', (code) => {
        process.exit(code ?? 0);
    });
} else if (argv.includes('-o')) {
    const options = resolveArgsFromArgv();

    if (!options) {
        console.error(`File or script not provided. Please specify a file or script to run.`);
        process.exit(1);
    }

    // read the content of './index.js' file;
    // append `run(options)` to the end of the content
    // run with `npx tsx` command
    const scriptPath = path.join(import.meta.dirname, 'index.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
    const modifiedScriptContent = `${scriptContent}\nrun(${JSON.stringify(options)});`;
    const tempScriptPath = path.join(import.meta.dirname, 'tempRunner.js');
    fs.writeFileSync(tempScriptPath, modifiedScriptContent);
    try {
        const child = spawn('npx', ['tsx', tempScriptPath], {
            stdio: 'inherit',
            shell: true, // Windows compatibility
        });

        child.on('exit', (code) => {
            fs.unlinkSync(tempScriptPath); // Clean up the temporary script
            process.exit(code ?? 0);
        });
    } catch (error) {
        console.error(`Error running the script: ${error}`);
        fs.unlinkSync(tempScriptPath); // Clean up the temporary script
        process.exit(1);
    }
} else {
    console.error(`File or script not provided. Please specify a file or script to run.`);
    console.log(`Usage: ts-script-runner <file.ts> [args]`);
    console.log(`Or: ts-script-runner -o [options]`);
    process.exit(1);
}
