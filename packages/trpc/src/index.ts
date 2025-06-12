import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { DB, games, getUser } from "@repo/db";
import { Subject } from "@repo/auth";
import SuperJSON from "superjson";
import { email } from "zod/v4";

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
  me: protectedProcedure.output(z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    name: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    picture: z.string().url()
  })).query(async ({ctx}) => {
    if (!ctx.subject){
      throw new TRPCError({code:'UNAUTHORIZED'})
    }

    const userId = ctx.subject?.properties.userId
    const user = await getUser(ctx.db, userId)

    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture
    }
  }),
  getGames: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional() }).optional())
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 1;
      return await ctx.db.select().from(games).limit(limit);
    }),
});

export type AppRouter = typeof appRouter;
