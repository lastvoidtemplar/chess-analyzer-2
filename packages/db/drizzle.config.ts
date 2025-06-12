import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  schema: './schema/index.ts',
  out: './migrations',
  dialect: "sqlite",
  dbCredentials: {
     url: path.join(__dirname, 'sqlite.db') 
  }
});