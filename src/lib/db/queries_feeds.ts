import { eq, sql } from "drizzle-orm";

import { db } from "./index";
import { feeds } from "./schema";
import { isUniqueViolation } from "./helpers";

import type { Feed } from "./schema";

export async function createFeed(name: string, url: string, userId: string): Promise<Feed | undefined> {
  try {
    const [result] = await db
      .insert(feeds)
      .values({ name, url, userId })
      .returning();

      return result;
  } catch (err){
    if (isUniqueViolation(err))  return undefined;
  }
}

export async function getAllFeeds(): Promise<Feed[]> {
  const result = await db
    .select()
    .from(feeds);
  return result;
}

export async function getFeedByUrl(url: string): Promise<Feed | undefined> {
  const [result] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));
  return result;
}

export async function markFeedFetched(feedId: string): Promise<boolean> {
  const [result] = await db
    .update(feeds)
    .set({ lastFetchedAt: new Date(), updatedAt: new Date() })
    .where(eq(feeds.id, feedId))
    .returning();

  return result !== undefined;
}

export async function getNextFeedToFetch(): Promise<Feed | undefined> {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return result;
}
