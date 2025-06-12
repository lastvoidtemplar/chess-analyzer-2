import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../schema";

export function createDB(dbpath:string) {
  const sqlite = new Database(dbpath);
  return drizzle(sqlite, { schema });
}
export type DB = ReturnType<typeof createDB>;
export * from "../schema";
