import type { Context } from "@repo/trpc";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { auth } from "./auth";
import { subjects } from "@repo/auth";
import { getDB, valkey } from "./config";

const db = getDB();

export async function createContext({
  req,
}: CreateExpressContextOptions): Promise<Context> {
  const header = req.headers.authorization;

  if (!header) {
    return { db ,valkey};
  }

  const spiltHeader = header?.split(" ");
  if (spiltHeader.length !== 2 || spiltHeader[0] !== "Bearer") {
    return { db ,valkey};
  }
  const token = spiltHeader[1];

  const verifyResult = await auth.verify(subjects, token);

  if (verifyResult.err) {
    return { db,valkey };
  }

  const subject = verifyResult.subject;

  return { db,valkey ,subject };
}
