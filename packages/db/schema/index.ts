import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  fen: text('fen').notNull(),
  analysis: text('analysis'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP')
});