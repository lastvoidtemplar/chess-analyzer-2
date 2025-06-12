import { eq } from "drizzle-orm";
import { DB, users } from ".";

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
  const result = await db
    .delete(users)
    .where(eq(users.userId, userId));
  return result.lastInsertRowid.toString();
}
