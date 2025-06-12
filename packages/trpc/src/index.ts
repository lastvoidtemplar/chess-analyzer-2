import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { DB, games } from "@repo/db";
import { Subject } from "@repo/auth";
import SuperJSON from "superjson";

export interface Context {
  db: DB;
  subject?: Subject;
}

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
});

const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(({ input, ctx, next }) => {
  if (!ctx.subject) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: ctx,
    input: input,
  });
});

export const appRouter = t.router({
  hello: publicProcedure.query(() => {
    return "Hello from tRPC!";
  }),
  secret: protectedProcedure.query(() => {
    return "Secret Found";
  }),
  getGames: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 1;
      return await ctx.db.select().from(games).limit(limit);
    }),
});

export type AppRouter = typeof appRouter;
