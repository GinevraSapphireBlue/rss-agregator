import { eq, and } from "drizzle-orm";

import { db } from "./index";
import { feedFollows, feeds, users  } from "./schema";

import type { FeedFollow } from "./schema";

export type FeedFollowWithNames = FeedFollow & { userName: string; feedName: string};

export async function createFeedFollow(userId: string, feedId: string): Promise<FeedFollowWithNames | undefined> {
  const [newFeedFollow] = await db.insert(feedFollows).values({ userId, feedId }).returning();
  if (!newFeedFollow) {
    return undefined;
  }
  const [selectResult] = await db
    .select({ 
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

export async function getFeedFollowsByUser(userId: string): Promise<FeedFollowWithNames[]> {
  const result = await db
    .select({ 
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
    .where(eq(feedFollows.userId, userId));

  return result;
}

export async function deleteFeedFollow(userId: string, feedUrl: string): Promise<boolean> {
  const [feed] = await db
    .select({ feedId: feeds.id })
    .from(feeds)
    .where(eq(feeds.url, feedUrl));
  if (!feed)
    return false;
  const [deletedFeedFollow] = await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.feedId))).returning();
  if (!deletedFeedFollow)
    return false;
  return true;
}
