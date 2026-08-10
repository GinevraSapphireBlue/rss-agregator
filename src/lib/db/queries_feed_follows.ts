import { eq } from "drizzle-orm";

import { db } from "./index";
import { feedFollows, feeds, users  } from "./schema";

import type { FeedFollow } from "./schema";

export async function createFeedFollow(userId: string, feedId: string): Promise<(FeedFollow & { userName: string; feedName: string}) | undefined> {
  const [newFeedFollow] = await db.insert(feedFollows).values({ userId, feedId }).returning();
  if (!newFeedFollow) {
    return undefined;
  }
  const [selectResult] = await db.select({ 
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      userName: users.name,
      feedId: feedFollows.feedId,
      feedName: feeds.name })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id));
  return selectResult;
}