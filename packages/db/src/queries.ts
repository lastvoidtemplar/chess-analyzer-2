import { eq, InferInsertModel } from "drizzle-orm";
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
  return gameId
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
