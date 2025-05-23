import { execSync } from 'child_process';
import { getOrPromptArg, getAllArgs } from './utils/get-arg';
import {
    getScript,
    getFileExportedFunctions,
    ScriptType,
    FUNCTION_DESCRIPTION_SEPARATOR,
} from './utils/runner/runner.utils';
import { globalCleaner } from './utils/cleanup';

export type Args = {
    /**
     * Where to place the bash script context
     * @default process.cwd()
     * @example /Users/username/projects/my-project
     */
    bashCwdLocation?: string;
    defaultScriptType?: ScriptType;
    /**
     * Whether to log all args passed to the script
     * @default true
     */
    logAllArgs?: boolean;
    /**
     * Whether to log the script execution time
     * @default true
     */
    logExecutionTime?: boolean;
    /**
     * The path to the folder containing the bash scripts
     * If not provided, no bash scripts will be found
     */
    bashScriptsFolder?: string;
    /**
     * The path to the folder containing the ts scripts
     * If not provided, no ts scripts will be found
     */
    tsScriptsFolder?: string;

    /**
     * By default and unless logAllArgs is set to false, the script will log all args passed to it with the `npm run ts-script-runner -- ` prefix
     * If you want to change the prefix of the command, you can use this option
     * @default 'npm run ts-script-runner -- '
     */
    commandLogPrefix?: string | null;
};

let scriptExecutionStartTime = new Date();

const main = async (args: Args) => {
    const { scriptPath, scriptType } = await getScript(args.tsScriptsFolder, args.bashScriptsFolder);

    console.log(`\n\nRunning ${scriptPath} ...\n`);

    // override this because we don't want to account for the time it takes to identify the script
    scriptExecutionStartTime = new Date();

    if (scriptType === ScriptType.Bash) {
        const extensionIfMissing = scriptPath.endsWith('.sh') ? '' : '.sh';
        const scriptPathWithExtension = 'bash ' + scriptPath + extensionIfMissing;

        const usedArgs = getAllArgs();
        const argv = process.argv.slice(2).filter((arg) => {
            // filter out the args that are not in the usedArgs
            return !usedArgs.some((usedArg) => {
                return arg.startsWith(usedArg.flag) || arg === usedArg.value;
            });
        });

        const forwardedArgs = argv.map((arg) => `"${arg}"`).join(' ');

        // run the bash script and pipe output to current process
        execSync(`${scriptPathWithExtension} ${forwardedArgs}`, {
            stdio: 'inherit',
            cwd: args.bashCwdLocation || process.cwd(),
            // pass the process.argv to the script
        });
        return;
    }

    // run the typescript script
    const exportedFunctions = await getFileExportedFunctions(scriptPath);

    let functionToRunName: string;
    let functionToRun: Function;

    if (exportedFunctions.length === 1) {
        functionToRunName = exportedFunctions[0].name;
        functionToRun = exportedFunctions[0].value;
    } else {
        functionToRunName = await getOrPromptArg({
            flag: '--function',
            description: 'Which function to run?',
            type: 'list',
            choices: exportedFunctions.map((f) => {
                if (f.description) return f.name + FUNCTION_DESCRIPTION_SEPARATOR + f.description;
                return f.name;
            }),
            mapChoiceAfterSelection: (choice) => {
                if (choice.includes(FUNCTION_DESCRIPTION_SEPARATOR)) {
                    return choice.split(FUNCTION_DESCRIPTION_SEPARATOR)[0];
                }
                return choice;
            },
        });

        const fn = exportedFunctions.find((f) => f.name === functionToRunName)?.value;

        if (!fn) {
            console.error(`Function ${functionToRunName} not found in ${scriptPath}`);

            process.exit(1);
        }

        functionToRun = fn;
    }

    console.log(`\n\nRunning ${functionToRunName} ...\n`);

    await functionToRun();
};

const logArgs = (prefix: string | null | undefined) => {
    if (prefix === undefined) {
        prefix = 'npm run ts-script-runner -- ';
    } else if (prefix === null) {
        prefix = '';
    }

    const args = getAllArgs()
        .map((a) => `${a.flag} ${a.value}`)
        .join(' ');

    console.log(`\n${prefix}${args}\n`);
};

const getExecutionTimeInSeconds = () => {
    const executionTimeInSeconds = (new Date().getTime() - scriptExecutionStartTime.getTime()) / 1000;
    return executionTimeInSeconds;
};

export const run = async (args: Args) => {
    return await main(args)
        .then(async () => {
            if (args.logExecutionTime !== false) {
                console.log(`\n✔ Script executed in ${getExecutionTimeInSeconds()} seconds\n`);
            }

            if (args.logAllArgs !== false) {
                logArgs(args.commandLogPrefix);
            }

            await globalCleaner.cleanup();
            process.exit(0);
        })
        .catch(async (error) => {
            if (args.logExecutionTime !== false) {
                console.log(`\n✘ Script failed in ${getExecutionTimeInSeconds()} seconds\n`);
            }
            console.error(error);

            if (args.logAllArgs !== false) {
                logArgs(args.commandLogPrefix);
            }

            await globalCleaner.cleanup();
            process.exit(1);
        });
};
