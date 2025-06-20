import { createDB, DB } from "@repo/db";
import dotenv from "dotenv";

dotenv.config()

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
export const GOOGLE_SECTET_ID = process.env.GOOGLE_SECRET_ID || ""
export const DB_PATH = process.env.DB_PATH || "../../packages/db/sqlite.db"

const db = createDB(DB_PATH)

export function getDB(): DB{
    return db
}