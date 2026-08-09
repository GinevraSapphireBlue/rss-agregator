import { db } from "./index";
import { feeds, users } from "./schema";

import type { Feed } from "./schema";

export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return result;
}
