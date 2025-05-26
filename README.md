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

### 2. Ways to Run the Script Runner

You can use **ts-script-runner** in several flexible ways:

#### **A. Run a TypeScript Script Directly**

```sh
yarn ts-script-runner my-script.ts
```
Runs a TypeScript file directly.

#### **B. Use a Custom Entrypoint**

```sh
yarn ts-script-runner src/scripts/index.ts
```
Where `index.ts` is your own entrypoint that calls `run({...})` from `ts-script-runner` with custom options.

#### **C. Pass Options Directly via CLI**

You can pass options (matching the `Args` type) directly to the runner:

```sh
yarn ts-script-runner -o --tsScriptsFolder src/scripts
```
or
```sh
npx ts-script-runner --tsScriptsFolder src/scripts
```

#### **D. With npm**

```sh
npm run ts-script-runner -- --tsScriptsFolder src/scripts
```
(Assuming you add a script in your `package.json`.)

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

- `run(options)`: Start the script runner (usually not called directly unless you want custom options).
- `describeFunction(fn, description)`: Attach a description to a function.
- `getOrPromptArg(options)`: Get an argument from CLI or prompt the user.
- `registerCleanup(callback)`: Register a cleanup callback.

## Example

```sh
npx ts-script-runner --tsScriptsFolder ./scripts --bashScriptsFolder ./bash
```

---

**See more usage examples at:**  
[https://github.com/adpopescu338/ts-script-runner-examples](https://github.com/adpopescu338/ts-script-runner-examples)

