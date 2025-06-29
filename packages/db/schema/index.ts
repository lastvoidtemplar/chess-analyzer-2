import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
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

export const gamePositions = sqliteTable(
  "game_positions",
  {
    gameId: text("game_id")
      .notNull()
      .references(() => games.gameId, {
        onDelete: "cascade",
      }),
    turn: integer("turn").notNull(),
    san: text("san"),
    lan: text("lan"),
    fen: text("fen"),
    scoreUnit: text("score_unit"),
    scoreValue: integer("score_value"),
    note: text("note").default("Note...").notNull(),
    linesGenerated: integer("lines_generated", {
      mode: "boolean",
    })
      .default(false)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.turn] })]
);

export const lines = sqliteTable(
  "lines",
  {
    gameId: text("game_id").notNull(),
    gameTurn: integer("game_turn").notNull(),
    line: integer("line").notNull(),
    scoreUnit: text("score_unit"),
    scoreValue: integer("score_value"),
  },
  (table) => [
    primaryKey({
      columns: [table.gameId, table.gameTurn, table.line],
    }),
    foreignKey({
      columns: [table.gameId, table.gameTurn],
      foreignColumns: [gamePositions.gameId, gamePositions.turn],
    }).onDelete("cascade"),
  ]
);

export const linesPositions = sqliteTable(
  "lines_positiions",
  {
    gameId: text("game_id").notNull(),
    gameTurn: integer("game_turn").notNull(),
    line: integer("line").notNull(),
    lineTurn: integer("line_turn").notNull(),
    san: text("san"),
    lan: text("lan"),
    fen: text("fen").notNull(),
    scoreUnit: text("score_unit").notNull(),
    scoreValue: integer("score_value").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.gameId, table.gameTurn, table.line, table.lineTurn],
    }),
    foreignKey({
      columns: [table.gameId, table.gameTurn, table.line],
      foreignColumns: [lines.gameId, lines.gameTurn, lines.line],
    }).onDelete("cascade"),
  ]
);

export const messages = sqliteTable("messages", {
  messageId: text("message_id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId, {
      onDelete: "cascade",
    }),
  message: text("message").default("").notNull(),
  timestamp: integer("timestamp").notNull(),
});
