import { and, eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { DB, gameHeaders, gameMoves, gamePositions, games, users } from ".";
import { v4 as uuid } from "uuid";

export async function checkIfUserExistById(db: DB, userId: string) {
  const result = await db
    .select({ userId: users.userId })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return result.length > 0;
}

export async function getUser(db: DB, userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return result[0];
}

type NewUser = typeof users.$inferInsert;

export async function createUser(db: DB, user: NewUser) {
  const result = await db.insert(users).values(user);
  return result.lastInsertRowid.toString();
}

export async function updateUser(db: DB, user: NewUser) {
  const result = await db
    .update(users)
    .set(user)
    .where(eq(users.userId, user.userId));
  return result.lastInsertRowid.toString();
}

export async function deleteUser(db: DB, userId: string) {
  const result = await db.delete(users).where(eq(users.userId, userId));
  return result.lastInsertRowid.toString();
}

export function createGame(
  db: DB,
  userId: string,
  name: string,
  result: string,
  headers: Record<string, string>,
  moves: string[]
) {
  const gameId = uuid();
  db.transaction((tx) => {
    try {
      tx.insert(games)
        .values({
          gameId: gameId,
          userId: userId,
          name: name,
          result: result,
        })
        .run();

      const headersBatch: InferInsertModel<typeof gameHeaders>[] = [];
      for (const header in headers) {
        headersBatch.push({
          gameId: gameId,
          header: header,
          value: headers[header],
        });
      }
      tx.insert(gameHeaders).values(headersBatch).run();

      let turn = 1;
      const movesBatch: InferInsertModel<typeof gameMoves>[] = [];
      for (const move of moves) {
        movesBatch.push({
          gameId: gameId,
          turn: turn,
          move: move,
        });
        turn++;
      }
      tx.insert(gameMoves).values(movesBatch).run();
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  return gameId;
}

export async function createPositions(db: DB, gameId: string, fens: string[]) {
  let turn = 1;
  const positionsBatch: InferInsertModel<typeof gamePositions>[] = [];
  for (const fen of fens) {
    positionsBatch.push({
      gameId: gameId,
      turn: turn,
      fen: fen,
    });
    turn++;
  }
  await db.insert(gamePositions).values(positionsBatch);
}

export type GameWithHeaders = InferSelectModel<typeof games> & {
  headers: Record<string, string>;
};

export async function getGamesWithHeaders(
  db: DB,
  userId: string,
  limit: number
): Promise<GameWithHeaders[]> {
  const res = await db
    .select()
    .from(games)
    .innerJoin(gameHeaders, eq(games.gameId, gameHeaders.gameId))
    .where(eq(games.userId, userId))
    .limit(limit);

  const groupGames = new Map<string, InferSelectModel<typeof games>>();
  const groupHeaders = new Map<string, Record<string, string>>();
  res.reduce(
    (maps: [typeof groupGames, typeof groupHeaders], cur) => {
      if (!maps[0].has(cur.games.gameId)) {
        maps[0].set(cur.games.gameId, cur.games);
      }
      if (!maps[1].has(cur.game_headers.gameId)) {
        maps[1].set(cur.game_headers.gameId, {});
      }

      maps[1].set(cur.game_headers.gameId, {
        ...maps[1].get(cur.game_headers.gameId)!,
        [cur.game_headers.header]: cur.game_headers.value,
      });
      return maps;
    },
    [groupGames, groupHeaders]
  );

  const r: GameWithHeaders[] = [];
  for (const [gameId, game] of groupGames) {
    r.push({
      ...game,
      headers: groupHeaders.get(gameId)!,
    });
  }

  return r;
}

export async function getGame(db: DB, gameId: string) {
  const res = await db
    .select()
    .from(games)
    .where(eq(games.gameId, gameId))
    .limit(1);
  if (res.length === 0) {
    return null;
  }
  return res[0];
}

export async function updateGame(db: DB, game: InferInsertModel<typeof games>) {
  const result = await db
    .update(games)
    .set(game)
    .where(eq(games.gameId, game.gameId));

  return result.lastInsertRowid.toString();
}

export async function updateGameHeaders(
  db: DB,
  gameId: string,
  headers: InferInsertModel<typeof gameHeaders>[]
) {
  for (const el of headers) {
    await db
      .update(gameHeaders)
      .set(el)
      .where(and(eq(gameHeaders.gameId, gameId), eq(gameHeaders.header, el.header)));
  }
}

export async function deleteGame(db: DB, gameId: string) {
  await db.delete(games).where(eq(games.gameId, gameId));
}
