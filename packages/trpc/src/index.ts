import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { DB, deleteUser, games, getUser, updateUser } from "@repo/db";
import { Subject } from "@repo/auth";
import SuperJSON from "superjson";
import { email } from "zod/v4";
import { parsePGN } from "./pgn";

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

  me: protectedProcedure
    .output(
      z.object({
        userId: z.string(),
        username: z.string(),
        name: z.string(),
        email: z.string().email(),
        picture: z.string().url(),
      })
    )
    .query(async ({ ctx }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const userId = ctx.subject?.properties.userId;
      const user = await getUser(ctx.db, userId);

      return {
        userId: user.userId,
        username: user.username,
        name: user.name,
        email: user.email,
        picture: user.picture,
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string(),
        name: z.string(),
        email: z.string().email(),
        picture: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.subject?.properties.userId !== input.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await updateUser(ctx.db, input);
    }),

  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.subject) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    await deleteUser(ctx.db, ctx.subject.properties.userId);
  }),

  getGames: publicProcedure
    .input(
      z.object({ limit: z.number().min(1).max(100).optional() }).optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 1;
      return await ctx.db.select().from(games).limit(limit);
    }),

  postGame: protectedProcedure
    .input(z.object({ pgn: z.string() }))
    .mutation(({ input, ctx }) => {
      const pgn = input.pgn;
      try {
        parsePGN(pgn);
      } catch (error) {
        console.log(error);
        
        if (error instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }
    }),
});

export type AppRouter = typeof appRouter;
