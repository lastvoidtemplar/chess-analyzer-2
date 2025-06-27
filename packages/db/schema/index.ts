import { table } from "console";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("user_id").primaryKey(),
  username: text("username").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  picture: text("picture").notNull(),
});

export const games = sqliteTable("games", {
  gameId: text("game_id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId, {
      onDelete: "cascade",
    }),
  name: text("name").notNull().unique(),
  result: text("result").notNull(),
});

export const gameHeaders = sqliteTable(
  "game_headers",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.gameId, {
        onDelete: "cascade",
      }),
    header: text("header").notNull(),
    value: text("value").notNull(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.header] })]
);

export const gameMoves = sqliteTable(
  "game_moves",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.gameId, {
        onDelete: "cascade",
      }),
    turn: integer("turn").notNull(),
    move: text("move").notNull(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.turn] })]
);

export const gamePositions = sqliteTable(
  "game_positions",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.gameId, {
        onDelete: "cascade",
      }),
    turn: integer("turn").notNull(),
    fen: text("fen").notNull(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.turn] })]
);
