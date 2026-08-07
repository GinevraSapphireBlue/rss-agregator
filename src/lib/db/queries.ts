import { eq } from "drizzle-orm";

import { db } from "./index";
import { users } from "./schema";

import type { User } from "./schema"

export async function createUser(name: string): Promise<User | undefined> {
  const [result] = await db
    .insert(users)
    .values({ name: name })
    .returning();
  return result;
}

export async function getUser(name: string): Promise<User | undefined> {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.name, name));
  return result;
}

export async function deleteAllUsers(): Promise<boolean> {
  const result = await db
    .delete(users)
    .returning();
  return result.length > 0
}