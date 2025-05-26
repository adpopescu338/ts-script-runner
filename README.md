# ts-script-runner

**ts-script-runner** is a tool for running and managing local TypeScript and Bash scripts in a consistent, interactive way.

## Features

- Discover and run TypeScript or Bash scripts from specified folders
- Interactive selection of scripts and exported functions
- Prompt for arguments interactively or via CLI flags
- Annotate functions with descriptions for better UX
- Register cleanup logic to run after script execution

## Usage

### 1. Install

Add to your project:

```sh
npm install ts-script-runner
```

### 2. Run the Script Runner

You can run the script runner in several ways:

**With npx:**

```sh
npx ts-script-runner --ts-scripts-folder ./scripts
```

**With yarn:**

```sh
yarn ts-script-runner --ts-scripts-folder ./scripts
```

Or, you can specify an entry point directly:

```sh
yarn ts-script-runner my-entry-point.ts
```

- You will be prompted to select a script and, for TypeScript, a function to run.
- If both TypeScript and Bash folders are provided, you can choose which type to run.

### 3. Annotate Functions (Optional)

Add descriptions to your exported functions for better prompts:

```ts
import { describeFunction } from 'ts-script-runner';

function myTask() {
  // ...
}
describeFunction(myTask, 'Does something important');
export { myTask };
```

### 4. Prompt for Arguments

Prompt for arguments in your scripts:

```ts
import { getOrPromptArg } from 'ts-script-runner';

const filename = await getOrPromptArg({ name: 'file', message: 'Enter filename:' });
```

### 5. Register Cleanup Logic

Register cleanup callbacks to run after your script:

```ts
import { registerCleanup } from 'ts-script-runner';

registerCleanup(() => {
  // cleanup logic
});
```

## API

- `run(options)`: Start the script runner (usually not called directly).
- `describeFunction(fn, description)`: Attach a description to a function.
- `getOrPromptArg(options)`: Get an argument from CLI or prompt the user.
- `registerCleanup(callback)`: Register a cleanup callback.

## Example

```sh
npx ts-script-runner --ts-scripts-folder ./scripts --bash-scripts-folder ./bash
```

---

For more advanced usage, see the examples in the `scripts` folder.

