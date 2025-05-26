declare enum ScriptType {
    Typescript = "typescript",
    Bash = "bash"
}

type Args = {
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
declare const run: (args: Args) => Promise<never>;

declare const describeFunction: (fn: Function, description: string) => void;

type PromptTypeToValue<Choices extends string[] | undefined = undefined> = {
    input: string;
    number: number;
    confirm: boolean;
    list: Choices extends string[] ? Choices[number] : string;
    rawlist: Choices extends string[] ? Choices[number] : string;
    expand: Choices extends string[] ? Choices[number] : string;
    checkbox: Choices extends string[] ? Choices[number][] : string[];
    password: string;
    editor: string;
};
type InferPromptType<Type extends keyof PromptTypeToValue | undefined, Choices extends string[] | undefined> = Type extends keyof PromptTypeToValue ? PromptTypeToValue<Choices>[Type] : PromptTypeToValue<Choices>['input'];
interface GetArgOptions<Type extends keyof PromptTypeToValue | undefined = undefined, Choices extends string[] | undefined = undefined> {
    /**
     * The command line flag to look for (e.g. '--file')
     */
    flag: string;
    /**
     * The type of prompt to use if no argument is provided
     * @default 'input'
     */
    type?: Type;
    /**
     * The message to display when prompting
     * If not provided, will use the description
     */
    message?: string;
    /**
     * If true, will always prompt regardless of command line arguments
     * @default false
     */
    forcePrompt?: boolean;
    /**
     * Description of the option for Commander
     */
    description: string;
    /**
     * The choices to display in the prompt for list-like types
     * If provided with a list-like type, the return type will be one of these choices
     */
    choices?: Choices;
    /**
     * A function to map the choice after selection
     */
    mapChoiceAfterSelection?: (choice: Choices extends undefined ? never : Choices extends string[] ? Choices[number] : never) => string;
    doNotCache?: boolean;
    validate?: (value: string) => boolean | string | Promise<string | boolean>;
}
/**
 * Gets a value either from command line arguments or by prompting the user
 *
 * @param options Configuration for argument parsing and prompting
 * @returns Promise resolving to the value from either command line or prompt
 *
 * @example
 * ```ts
 * // Simple string input
 * const filename = await getOrPromptArg({
 *   flag: '--file',
 *   description: 'Input filename'
 * }) // returns Promise<string>
 *
 * // Boolean confirmation
 * const isConfirmed = await getOrPromptArg({
 *   flag: '--confirm',
 *   description: 'Confirm action',
 *   type: 'confirm'
 * }) // returns Promise<boolean>
 *
 * // List with specific choices
 * const color = await getOrPromptArg({
 *   flag: '--color',
 *   description: 'Pick a color',
 *   type: 'list',
 *   choices: ['red', 'blue', 'green'] as const
 * }) // returns Promise<'red' | 'blue' | 'green'>
 * ```
 */
declare function getOrPromptArg<Type extends keyof PromptTypeToValue | undefined = undefined, Choices extends string[] | undefined = undefined>(options: GetArgOptions<Type, Choices>): Promise<InferPromptType<Type, Choices>>;

declare const registerCleanup: (callback: () => void | Promise<void>) => void;

export { type Args, describeFunction, getOrPromptArg, registerCleanup, run };
