import { sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable("users", {
  userId: text('id').primaryKey(),
  username: text().notNull(),
  name: text("name").notNull(),
  email: text('email').notNull(),
  picture: text("picture").notNull()
})

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fen: text('fen').notNull(),
  analysis: text('analysis'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP')
});