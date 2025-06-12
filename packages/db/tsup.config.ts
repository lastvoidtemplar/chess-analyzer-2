import { copyFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { defineConfig } from 'tsup';

const nativeBindingPath = 'node_modules/better-sqlite3/build/Release/better_sqlite3.node';
const outDir = 'dist';

export default defineConfig({
  entry: ['src/index.ts', "schema/index.ts"],
  format: ['esm', "cjs"],
  dts: true,
  clean: true,
  external: ['better-sqlite3'],
  onSuccess: async() => {
    const targetPath = `${outDir}/better_sqlite3.node`;
    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(nativeBindingPath, targetPath);
    console.log('✅ Native binding copied to dist/');
  },
});