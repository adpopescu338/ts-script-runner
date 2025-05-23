import inquirer from 'inquirer';
import { Command } from 'commander';

// cache the args, so at the end we can log them
const argsCache: Array<{
    flag: string;
    value: string;
}> = [];

export const getAllArgs = () => argsCache;

type PromptTypeToValue<Choices extends string[] | undefined = undefined> = {
    input: string;
    number: number;
    confirm: boolean;
    list: Choices extends string[] ? Choices[number] : string;
    rawlist: Choices extends string[] ? Choices[number] : string;
    expand: Choices extends string[] ? Choices[number] : string;
    checkbox: string[];
    password: string;
    editor: string;
};

type InferPromptType<
    Type extends keyof PromptTypeToValue | undefined,
    Choices extends string[] | undefined,
> = Type extends keyof PromptTypeToValue ? PromptTypeToValue<Choices>[Type] : PromptTypeToValue<Choices>['input'];

interface GetArgOptions<
    Type extends keyof PromptTypeToValue | undefined = undefined,
    Choices extends string[] | undefined = undefined,
> {
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
    mapChoiceAfterSelection?: (
        choice: Choices extends undefined ? never : Choices extends string[] ? Choices[number] : never,
    ) => string;

    doNotCache?: boolean;

    validate?: (value: string) => boolean | string | Promise<string | boolean>;
}

/**
 * Formats a command line argument value based on the expected prompt type
 */
function formatValue<T extends keyof PromptTypeToValue>(value: string, type: T): PromptTypeToValue[T] {
    switch (type) {
        case 'number':
            const num = Number(value);
            if (isNaN(num)) {
                throw new Error(`Value "${value}" cannot be converted to a number`);
            }
            return num as PromptTypeToValue[T];

        case 'confirm':
            return (value.toLowerCase() === 'true' || value === '1') as PromptTypeToValue[T];

        case 'checkbox':
            return value
                .split(',')
                .map((v) => v.trim())
                .filter(Boolean) as PromptTypeToValue[T];

        default:
            return value as PromptTypeToValue[T];
    }
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
export async function getOrPromptArg<
    Type extends keyof PromptTypeToValue | undefined = undefined,
    Choices extends string[] | undefined = undefined,
>(options: GetArgOptions<Type, Choices>): Promise<InferPromptType<Type, Choices>> {
    const {
        flag,
        description,
        forcePrompt = false,
        type = 'input' as Type,
        choices,
        mapChoiceAfterSelection,
        doNotCache,
    } = options;

    const program = new Command()
        .allowUnknownOption(true)
        .option(`${flag} <value>`, description)
        .allowExcessArguments(true);

    try {
        program.parse(process.argv);
    } catch (error) {
        console.error('Error parsing args', {
            flag,
            description,
            type,
            error,
        });

        throw error;
    }
    const opts = program.opts();

    // Convert kebab-case to camelCase for the flag name
    const flagName = flag.replace(/^-+/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    const value = opts[flagName];

    // Validate that the value from args is one of the choices if choices are provided
    if (value && choices && (type === 'list' || type === 'rawlist' || type === 'expand')) {
        if (!choices.includes(value)) {
            if (mapChoiceAfterSelection) {
                const allChoicesMapped = choices.map(mapChoiceAfterSelection as any);

                const mappedValue = mapChoiceAfterSelection(value);

                if (!allChoicesMapped.includes(mappedValue)) {
                    throw new Error(`Value "${value}" must be one of:\n${allChoicesMapped.join('\n')}\n`);
                }
            } else {
                throw new Error(`Value "${value}" must be one of:\n${choices.join('\n')}\n`);
            }
        }
    }

    // If force prompt is enabled or no value in command line, use prompt
    if (forcePrompt || !value) {
        const response = await inquirer.prompt({
            type: type as keyof PromptTypeToValue,
            message: options.message ?? description,
            name: 'value',
            validate: options.validate,
            ...(choices ? { choices } : {}),
        } as any);

        const value =
            typeof mapChoiceAfterSelection === 'function' ? mapChoiceAfterSelection(response.value) : response.value;

        if (!doNotCache) {
            argsCache.push({
                flag,
                value: String(value),
            });
        }

        return value as InferPromptType<Type, Choices>;
    }

    const formattedValue = formatValue(value, type as keyof PromptTypeToValue) as InferPromptType<Type, Choices>;

    if (!doNotCache) {
        argsCache.push({
            flag,
            value: String(formattedValue),
        });
    }

    return formattedValue;
}
