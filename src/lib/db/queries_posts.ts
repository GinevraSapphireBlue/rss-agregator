import { db } from ".";
import { desc, eq } from "drizzle-orm";
import { feedFollows, feeds, posts } from "./schema";

import type { Post } from "./schema";
import { isUniqueViolation } from "./helpers";

export async function createPost(title: string, url: string, description: string, publishedAt: Date, feedId: string): Promise<Post | undefined> {
  try {
    const [result] = await db
      .insert(posts)
      .values({ title, url, description, publishedAt, feedId })
      .returning();

    return result;
  } catch (err) {
    if (isUniqueViolation(err)) return undefined;
  }

}

export async function getPostsForUser(userId: string, maxPosts: number): Promise<(Post & { feedUrl: string; feedName: string })[]> {
  if (maxPosts <= 0) {
    throw new Error("Invalid parameter maxPosts, number of posts can be limited only by positive number");
  }
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
      feedName: feeds.name,
      feedUrl: feeds.url,
    })
    .from(posts)
    .innerJoin(feeds, eq(feeds.id, posts.feedId))
    .innerJoin(feedFollows, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(maxPosts);

  return result;
}