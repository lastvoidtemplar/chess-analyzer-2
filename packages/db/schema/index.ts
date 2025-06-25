import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: text("id").primaryKey(),
  username: text("username").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  picture: text("picture").notNull(),
});

export const games = sqliteTable("games", {
  gameId: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.userId),
  event: text("event"),
  site: text("site"),
  date: text("date"),
  white: text("white"),
  black: text("black"),
  result: text("result"),
  timeControl: text("time_control"),
  whiteElo: text("white_elo"),
  blackElo: text("black_elo"),
  eco: text("eco"),
});

export const moves = sqliteTable(
  "moves",
  {
    moveId: integer("move_id").notNull(),
    gameId: text("game_id").references(() => games.gameId),
    notation: text("notation").notNull(),
    whiteMove: integer({mode:"boolean"})
  },
  (table) => [primaryKey({ columns: [table.gameId, table.moveId] })]
);
