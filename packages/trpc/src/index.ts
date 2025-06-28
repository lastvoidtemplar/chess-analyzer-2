import { inferRouterOutputs, initTRPC, tracked, TRPCError } from "@trpc/server";
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
  getPositions,
  getHeaders,
  getPositionNote,
  updatePositionNote,
  saveMessage,
  getMessages,
} from "@repo/db";
import { Subject } from "@repo/auth";
import SuperJSON from "superjson";
import { parsePGN } from "./pgn";
import Valkey from "iovalkey";
import { publishFensTask } from "./valkey";
import EventEmitter, { on } from "events";
import { v4 as uuid } from "uuid";

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

const ee = new EventEmitter();
ee.setMaxListeners(0);

type ChatMessage = {
  id: string;
  username: string;
  userPicture: string;
  message: string;
  timestamp: number;
};

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
    .input(z.object({ gameId: z.string() }).catchall(z.string()))
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
        const { gameId, ...headers } = input;
        const arr = Object.entries(headers).map(([header, value]) => {
          return {
            gameId: gameId,
            header: header,
            value: value,
          };
        });
        await updateGameHeaders(ctx.db, gameId, arr);
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

  getPositions: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
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

      const headers = await getHeaders(ctx.db, game.gameId);
      let white = "Player 1";
      let black = "Player 2";
      let whiteElo = 1400;
      let blackElo = 1400;

      for (const header of headers) {
        switch (header.header) {
          case "White":
            white = header.value;
            break;
          case "Black":
            black = header.value;
            break;
          case "WhiteElo":
            try {
              whiteElo = parseInt(header.value);
            } catch (err) {
              console.log(`Game Id - ${game.gameId}, White elo is not int`);
            }
            break;
          case "BlackElo":
            try {
              blackElo = parseInt(header.value);
            } catch (err) {
              console.log(`Game Id - ${game.gameId}, Black elo is not int`);
            }
            break;
        }
      }

      const positions = await getPositions(ctx.db, game.gameId);

      if (positions[0].scoreUnit === null) {
        return {
          status: "generating" as const,
          gameId: game.gameId,
          name: game.name,
          white,
          black,
          whiteElo,
          blackElo,
        };
      }

      return {
        status: "ready" as const,
        gameId: game.gameId,
        name: game.name,
        positions: positions,
        white,
        black,
        whiteElo,
        blackElo,
      };
    }),
  getPositionNote: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        turn: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      const note = await getPositionNote(ctx.db, input.gameId, input.turn);

      return {
        note,
      };
    }),

  updatePositionNote: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        turn: z.number(),
        note: z.string(),
      })
    )
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

      await updatePositionNote(ctx.db, input.gameId, input.turn, input.note);
    }),
  getChatMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const messages = await getMessages(ctx.db, input.limit ?? 50);

      const res:ChatMessage[] = messages.map(({messages,users})=>{
        return {
          id: messages.messageId,
          username: users.username,
          userPicture: users.picture,
          message: messages.message,
          timestamp: messages.timestamp
        }
      })

      return res
    }),
  sendChatMessage: protectedProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.subject) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await getUser(ctx.db, ctx.subject.properties.userId);

      const chatMessage: ChatMessage = {
        id: uuid(),
        username: user.username,
        userPicture: user.picture,
        message: input.message,
        timestamp: Date.now(),
      };

      await saveMessage(ctx.db, {
        messageId: chatMessage.id,
        userId: user.userId,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp,
      });

      ee.emit("message", chatMessage);
    }),

  onChatMessage: protectedProcedure.subscription(async function* ({ signal }) {
    for await (const [msg] of on(ee, "message", {
      signal,
    }) as AsyncIterable<ChatMessage[]>) {
      console.log(msg);

      yield tracked(msg.id.toString(), msg);
    }
  }),
});

export type GameWithHeaders = GameWithHeadersType;
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
