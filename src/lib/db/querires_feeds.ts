import { db } from "./index";
import { feeds } from "./schema";

import type { Feed } from "./schema";

export async function createFeed(name: string, url: string, userId: string): Promise<Feed> {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return result;
}

export async function getAllFeeds(): Promise<Feed[]> {
  const result = await db
    .select()
    .from(feeds);
  return result;
}
