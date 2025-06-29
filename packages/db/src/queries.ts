import {
  and,
  desc,
  eq,
  InferInsertModel,
  InferSelectModel,
  not,
} from "drizzle-orm";
import {
  DB,
  gameHeaders,
  gamePositions,
  games,
  lines,
  linesPositions,
  messages,
  users,
} from ".";
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
  sans: string[],
  lans: string[]
) {
  const gameId = uuid();

  if (sans.length !== lans.length) {
    throw new Error("Not matching length for sans and lans");
  }

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

      const movesBatch: InferInsertModel<typeof gamePositions>[] = [];
      for (let ind = 0; ind < sans.length; ind++) {
        movesBatch.push({
          gameId: gameId,
          turn: ind + 1,
          san: sans[ind],
          lan: lans[ind],
        });
      }

      tx.insert(gamePositions).values(movesBatch).run();
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
  return gameId;
}

export function createPositions(db: DB, gameId: string, fens: string[]) {
  db.transaction((tx) => {
    tx.insert(gamePositions)
      .values({
        gameId: gameId,
        turn: 0,
        fen: fens[0],
      })
      .run();
    let turn = 1;
    for (const fen of fens.slice(1)) {
      tx.update(gamePositions)
        .set({ fen })
        .where(
          and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, turn))
        )
        .run();
      turn++;
    }
  });
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

export async function getHeaders(db: DB, gameId: string) {
  const res = await db
    .select()
    .from(gameHeaders)
    .where(eq(gameHeaders.gameId, gameId));
  return res;
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
      .where(
        and(eq(gameHeaders.gameId, gameId), eq(gameHeaders.header, el.header))
      );
  }
}

export async function deleteGame(db: DB, gameId: string) {
  await db.delete(games).where(eq(games.gameId, gameId));
}

export async function getPositions(db: DB, gameId: string) {
  const result = await db
    .select()
    .from(gamePositions)
    .where(eq(gamePositions.gameId, gameId));

  const arr: {
    san: string | null;
    lan: string | null;
    fen: string | null;
    scoreUnit: "cp" | "mate" | null;
    scoreValue: number | null;
  }[] = new Array(result.length);
  result.forEach((el) => {
    arr[el.turn] = {
      san: el.san,
      lan: el.lan,
      fen: el.fen,
      scoreUnit: el.scoreUnit as "cp" | "mate",
      scoreValue: el.scoreValue,
    };
  });

  return arr;
}

type Score = {
  unit: "cp" | "mate" | null;
  score: number | null;
};

export function createScores(db: DB, gameId: string, scores: Score[]) {
  db.transaction((tx) => {
    let turn = 0;
    let minus = 1;
    for (const score of scores) {
      tx.update(gamePositions)
        .set({ scoreUnit: score.unit, scoreValue: minus * (score.score ?? 0) })
        .where(
          and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, turn))
        )
        .run();
      turn++;
      minus *= -1;
    }
  });
}

export async function getPositionFen(db: DB, gameId: string, turn: number) {
  const res = await db
    .select({
      fen: gamePositions.fen,
    })
    .from(gamePositions)
    .where(and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, turn)))
    .limit(1);

  if (res.length === 0 || !res[0].fen) {
    return null;
  }
  return res[0].fen;
}
export async function getPositionScore(db: DB, gameId: string, turn: number) {
  const res = await db
    .select({
      scoreUnit: gamePositions.scoreUnit,
      scoreValue: gamePositions.scoreValue,
    })
    .from(gamePositions)
    .where(and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, turn)))
    .limit(1);

  if (res.length === 0 || !res[0]) {
    return null;
  }
  return res[0];
}

export async function getPositionNote(db: DB, gameId: string, turn: number) {
  const res = await db
    .select({
      note: gamePositions.note,
    })
    .from(gamePositions)
    .where(and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, turn)))
    .limit(1);

  if (res.length === 0 || !res[0].note) {
    return "";
  }
  return res[0].note;
}

export async function updatePositionNote(
  db: DB,
  gameId: string,
  turn: number,
  note: string
) {
  const res = await db
    .update(gamePositions)
    .set({
      note: note,
    })
    .where(and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, turn)));

  return res.lastInsertRowid;
}

type Message = typeof messages.$inferInsert;

export async function saveMessage(db: DB, message: Message) {
  const result = await db.insert(messages).values(message);
  return result.lastInsertRowid.toString();
}

export async function getMessages(db: DB, limit: number = 50) {
  const result = await db
    .select()
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.userId))
    .orderBy(desc(messages.timestamp))
    .limit(limit);
  return result;
}

export async function lineGenerated(db: DB, gameId: string, gameTurn: number) {
  const result = await db
    .select({
      generated: gamePositions.linesGenerated,
    })
    .from(gamePositions)
    .where(
      and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, gameTurn))
    );

  if (result.length === 0) {
    console.error("not existing game position", gameId, gameTurn);
    return true;
  }

  return result[0].generated;
}

export async function markLinesGenerated(
  db: DB,
  gameId: string,
  gameTurn: number
) {
  const result = await db
    .update(gamePositions)
    .set({
      linesGenerated: true,
    })
    .where(
      and(eq(gamePositions.gameId, gameId), eq(gamePositions.turn, gameTurn))
    );

  return result.lastInsertRowid;
}

export function createLine(
  db: DB,
  gameId: string,
  gameTurn: number,
  line: number,
  score: Score,
  positions: (typeof linesPositions.$inferInsert)[]
) {
  db.transaction((tx) => {
    tx.insert(lines)
      .values({
        gameId: gameId,
        gameTurn: gameTurn,
        line: line,
        scoreUnit: score.unit,
        scoreValue: score.score,
      })
      .run();

    tx.insert(linesPositions).values(positions).run();
  });
}

export async function getLines(db: DB, gameId: string, gameTurn: number) {
  const result = await db
    .select()
    .from(lines)
    .innerJoin(
      linesPositions,
      and(
        eq(lines.gameId, linesPositions.gameId),
        eq(lines.gameTurn, linesPositions.gameTurn),
        eq(lines.line, linesPositions.line)
      )
    )
    .where(and(eq(lines.gameId, gameId), eq(lines.gameTurn, gameTurn)));
  return result;
}
