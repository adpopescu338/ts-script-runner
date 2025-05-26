import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);

const rawTargetFilePath = argv.shift();

if (!rawTargetFilePath) {
    console.error('No file name provided');
    process.exit(1);
}

// Normalize and resolve the path for cross-platform compatibility
const targetFilePath = path.resolve(path.normalize(rawTargetFilePath));

// Optionally check if the file exists before spawning
if (!fs.existsSync(targetFilePath)) {
    console.error(`File not found: ${targetFilePath}`);
    process.exit(1);
}

const child = spawn('npx', ['tsx', targetFilePath, ...argv], {
    stdio: 'inherit',
    shell: true, // Windows compatibility
});

child.on('exit', (code) => {
    process.exit(code ?? 0);
});
