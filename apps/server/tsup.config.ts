import { defineConfig } from 'tsup';

const nativeBindingPath = 'node_modules/@repo/db/dist/better_sqlite3.node';
const outDir = 'dist';

export default defineConfig({
  entry: ['src/index.ts', "schema/index.ts"],
  format: ['esm', "cjs"],
  dts: true,
  clean: true,
  external: ['better-sqlite3', "@repo/db"],
  onSuccess: async() => {
    await new Promise(res=>setTimeout(res, 2000))
  },
});
