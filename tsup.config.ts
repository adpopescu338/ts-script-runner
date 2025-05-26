import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  splitting: false,
  sourcemap: false,
  clean: true,
  format: ['esm'],
  dts: true,
  external: ["commander", "inquirer"]
})