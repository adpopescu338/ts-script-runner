// src/bin.ts
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
var argv = process.argv.slice(2);
var rawTargetFilePath = argv.shift();
if (!rawTargetFilePath) {
  console.error("No file name provided");
  process.exit(1);
}
var targetFilePath = path.resolve(path.normalize(rawTargetFilePath));
if (!fs.existsSync(targetFilePath)) {
  console.error(`File not found: ${targetFilePath}`);
  process.exit(1);
}
var child = spawn("npx", ["tsx", targetFilePath, ...argv], {
  stdio: "inherit",
  shell: true
  // Windows compatibility
});
child.on("exit", (code) => {
  process.exit(code ?? 0);
});
