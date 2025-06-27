import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createGame,
  DB,
  deleteGame,
  deleteUser,
  getGame,
  getGamesWithHeaders,
  getUser,
  updateUser,
  GameWithHeaders as GameWithHeadersType,
  updateGame,
  updateGameHeaders,
} from "@repo/db";
import { Subject } from "@repo/auth";
import SuperJSON from "superjson";
import { parsePGN } from "./pgn";
import Valkey from "iovalkey";
import { publishFensTask } from "./valkey";

export interface Context {
  db: DB;
  valkey: Valkey;
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

  getGames: protectedProcedure
    .input(
      z.object({ limit: z.number().min(1).max(100).optional() }).optional()
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const limit = input?.limit ?? 50;
      const games = await getGamesWithHeaders(
        ctx.db,
        ctx.subject.properties.userId,
        limit
      );
      return games;
    }),

  postGame: protectedProcedure
    .input(z.object({ name: z.string().min(3), pgn: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const pgn = input.pgn;
      try {
        const parsed = parsePGN(pgn);
        const gameId = createGame(
          ctx.db,
          ctx.subject.properties.userId,
          input.name,
          parsed.result,
          parsed.headers,
          parsed.sans,
          parsed.lans
        );
        await publishFensTask(ctx.valkey, gameId, parsed.lans);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }
    }),

  updateGame: protectedProcedure
    .input(z.object({ gameId: z.string(), name: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const game = await getGame(ctx.db, input.gameId);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (game.userId !== ctx.subject.properties.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      try {
        await updateGame(ctx.db, {
          gameId: input.gameId,
          userId: game.userId,
          name: input.name,
          result: game.result,
        });
      } catch (err) {
        if (err instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
        }
      }
    }),
  updateGameHeaders: protectedProcedure
    .input(z.object({ gameId: z.string()}).catchall(z.string()))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const game = await getGame(ctx.db, input.gameId);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (game.userId !== ctx.subject.properties.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      try {
        const {gameId, ...headers} = input
        const arr = Object.entries(headers).map(([header, value])=>{
          return {
            gameId: gameId,
            header: header,
            value: value
          }
        })
        await updateGameHeaders(ctx.db, gameId, arr)
      } catch (err) {
        if (err instanceof Error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
        }
      }
    }),

  deleteGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const game = await getGame(ctx.db, input.gameId);
      if (!game) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (game.userId !== ctx.subject.properties.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await deleteGame(ctx.db, input.gameId);
    }),
});

export type GameWithHeaders = GameWithHeadersType;
export type AppRouter = typeof appRouter;
