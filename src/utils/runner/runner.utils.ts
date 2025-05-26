import path from 'path';
import fs from 'fs';
import { getOrPromptArg } from '../get-arg';
import { getFunctionDescription } from '../function-description';
import { memoize } from './memoize';
import { pathToFileURL } from 'url';
import { ExportedFunction, ScriptType } from './types';

export const FUNCTION_DESCRIPTION_SEPARATOR = ' - ';

/**
 * Returns an array of objects with the name and value of all exported functions from a file
 * Will work with a simple export function or a named export, or a default export
 * Will also work with a barrel file that re-exports the functions from other files
 */
export const getFileExportedFunctions = memoize(async (filePath: string) => {
    const fileUrl = pathToFileURL(filePath).href;
    let fileContent = await import(fileUrl);

    if (
        Object.keys(fileContent).length === 2 &&
        typeof fileContent.default === 'object' &&
        typeof fileContent['module.exports'] === 'object' &&
        Object.keys(fileContent.default).length === Object.keys(fileContent['module.exports']).length
    ) {
        fileContent = fileContent.default;
    }

    const allExports = Object.entries(fileContent);

    const formattedExports = allExports.map(([exportName, exportValue]) => {
        return {
            name: exportName,
            value: exportValue,
            description: typeof exportValue === 'function' ? getFunctionDescription(exportValue) : undefined,
        };
    });

    const exportedFunctions = formattedExports.filter(
        ({ value }) => typeof value === 'function',
    ) as Array<ExportedFunction>;

    return exportedFunctions;
});

/**
 * Returns the names of all ts scripts in the ts-scripts folder
 * If the script is a directory, it will check if it has an index.ts file with any exported functions
 */
const getTsScripts = async (scriptsPath: string) => {
    const dirContent = fs.readdirSync(scriptsPath);

    const validDirContent: string[] = [];

    for (const file of dirContent) {
        if (file.endsWith('.ts')) {
            const exportedFunctions = await getFileExportedFunctions(path.join(scriptsPath, file));

            if (exportedFunctions.length === 0) continue;

            if (exportedFunctions.length === 1) {
                const { description } = exportedFunctions[0];
                const functionNameAndDescription = description
                    ? file.replace('.ts', '') + FUNCTION_DESCRIPTION_SEPARATOR + description
                    : file.replace('.ts', '');

                validDirContent.push(functionNameAndDescription);
                continue;
            }

            validDirContent.push(file.replace('.ts', ''));
            continue;
        }

        // check if it's a directory
        const dirPath = path.join(scriptsPath, file);
        if (!fs.statSync(dirPath).isDirectory()) continue;

        // check whether the dir has an index.ts file
        const indexPath = path.join(dirPath, 'index.ts');
        if (!fs.existsSync(indexPath)) continue;

        // check if the index.ts file has any exported functions
        const exportedFunctions = await getFileExportedFunctions(indexPath);
        if (exportedFunctions.length === 0) continue;

        validDirContent.push(file);
    }

    return validDirContent;
};

const getBashScripts = (scriptsPath: string) => {
    const scripts = fs.readdirSync(scriptsPath);

    const validDirContent: string[] = [];

    for (const file of scripts) {
        if (file.endsWith('.sh')) validDirContent.push(file.replace('.sh', ''));
    }

    return validDirContent;
};

export const getScript = async (tsScriptsFolder: string | undefined, bashScriptsFolder: string | undefined) => {
    let scriptType: ScriptType;

    if (tsScriptsFolder && !bashScriptsFolder) {
        scriptType = ScriptType.Typescript;
    } else if (bashScriptsFolder && !tsScriptsFolder) {
        scriptType = ScriptType.Bash;
    } else if (!tsScriptsFolder && !bashScriptsFolder) {
        throw new Error('No scripts folder provided');
    } else {
        // ask what type of script to run, either ts or sh file
        scriptType = await getOrPromptArg({
            flag: '--script-type',
            description: 'What type of script to run?',
            type: 'list',
            choices: Object.values(ScriptType),
        });
    }

    const scriptsPath = (scriptType === ScriptType.Typescript ? tsScriptsFolder : bashScriptsFolder) as string;

    const scripts =
        scriptType === ScriptType.Typescript ? await getTsScripts(scriptsPath) : getBashScripts(scriptsPath);

    if (scripts.length === 0) {
        console.error(`No ${scriptType} scripts found in ${scriptsPath}`);
        process.exit(0);
    }

    // ask which script to run
    const fileName = await getOrPromptArg({
        flag: '--file',
        description: 'Which script to run?',
        type: 'list',
        choices: scripts,
        mapChoiceAfterSelection: (choice) => {
            if (choice.includes(FUNCTION_DESCRIPTION_SEPARATOR)) {
                return choice.split(FUNCTION_DESCRIPTION_SEPARATOR)[0];
            }
            return choice;
        },
    });

    // run the script
    const scriptPath = path.join(scriptsPath, fileName);

    return { scriptPath, scriptType };
};
