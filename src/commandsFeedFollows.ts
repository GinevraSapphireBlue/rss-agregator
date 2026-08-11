import { createFeedFollow, deleteFeedFollow, getFeedFollowsByUser } from "./lib/db/queries_feed_follows";
import { getFeedByUrl } from "./lib/db/querires_feeds";

import type { User } from "./lib/db/schema";

export async function handlerFollowFeed(_cmdName: string, user: User, url: string, ...args: string[]): Promise<void> {
  if (!url) {
    throw new Error("Missing argument, url is required");
  }

  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error("Feed could not be found");

  const newFollowFeed = await createFeedFollow(user.id, feed.id);
  if (!newFollowFeed) throw new Error("Feed could not be followed");

  console.log(`User ${newFollowFeed.userName} followed feed ${newFollowFeed.feedName}.`);
}

export async function handlerAllFollowingFeeds(_cmdName: string, user: User, ...args: string[]): Promise<void> {
  const feedsFollows = await getFeedFollowsByUser(user.id);
  if (!feedsFollows) throw new Error("No feed follows could not be found");
  
  console.log(`User ${user.name} follows: `);
  for (const follow of feedsFollows) {
    console.log(`- ${follow.feedName}`);
  }
}

export async function handlerUnfollowFeed(_cmdName: string, user: User, url: string, ...args: string[]): Promise<void> {
  if (!url) {
    throw new Error("Missing argument, url is required");
  }

  const success = await deleteFeedFollow(user.id, url);
  if (!success) throw new Error(`Unfollowing ${url} failed`);
  
  console.log(`User ${user.name} unfollowed feed ${url}`);
}