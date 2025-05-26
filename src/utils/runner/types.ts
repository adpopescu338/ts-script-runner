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

export enum ScriptType {
    Typescript = 'typescript',
    Bash = 'bash',
}

export type ExportedFunction = {
    name: string;
    value: Function;
    description: string | undefined;
};
