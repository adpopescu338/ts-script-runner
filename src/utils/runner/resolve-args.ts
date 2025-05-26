import { Command } from 'commander';
import { Args, ScriptType } from './types';

function parseBooleanFlag(value: string | undefined, flagName: string): boolean | undefined {
    if (value === undefined) return undefined;
    if (value === '1' || value === 'true') return true;
    if (value === '0' || value === 'false') return false;
    throw new Error(`Invalid value for --${flagName}: "${value}". Expected 1, 0, "true", or "false".`);
}

export function resolveArgsFromArgv(): Args | undefined {
    const argv = process.argv.slice(2);
    const program = new Command();

    program
        .option('--bashCwdLocation <path>', 'Where to place the bash script context')
        .option('--defaultScriptType <type>', 'Default script type (typescript|bash)')
        .option('--logAllArgs <bool>', 'Whether to log all args passed to the script (1/0/true/false)')
        .option('--logExecutionTime <bool>', 'Whether to log the script execution time (1/0/true/false)')
        .option('--bashScriptsFolder <path>', 'Path to the folder containing bash scripts')
        .option('--tsScriptsFolder <path>', 'Path to the folder containing ts scripts')
        .option('--commandLogPrefix <prefix>', 'Prefix for command log', 'npm run ts-script-runner -- ');

    program.parse(argv, { from: 'user' });
    const opts = program.opts();

    const args: Args = {
        bashCwdLocation: opts.bashCwdLocation,
        defaultScriptType: opts.defaultScriptType as ScriptType | undefined,
        logAllArgs: parseBooleanFlag(opts.logAllArgs, 'logAllArgs'),
        logExecutionTime: parseBooleanFlag(opts.logExecutionTime, 'logExecutionTime'),
        bashScriptsFolder: opts.bashScriptsFolder,
        tsScriptsFolder: opts.tsScriptsFolder,
        commandLogPrefix: opts.commandLogPrefix,
    };

    // if empty, return undefined
    const isNotEmpty = Object.values(args).some((value) => value !== undefined && value !== null);

    if (isNotEmpty) {
        return args;
    }

    return undefined;
}
