import { eq } from "drizzle-orm";

import { db } from "./index";
import { feeds } from "./schema";

import type { Feed } from "./schema";

export async function createFeed(name: string, url: string, userId: string): Promise<Feed | undefined> {
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

export async function getFeedByUrl(url: string): Promise<Feed | undefined> {
  const [result] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));
  return result;
}
