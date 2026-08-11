import { createFeedFollow } from "./lib/db/queries_feed_follows";
import { getFeedByUrl } from "./lib/db/querires_feeds";

import type { CommandHandler } from "./comandRegistry";
import type { feedFollows, Feed, User } from "./lib/db/schema";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries_users";

export async function handlerFollowFeed(_cmdName: string, url: string, ...args: string[]): Promise<void> {
  if (!url) {
    throw new Error("Missing argument, url is required");
  }

  const userName = readConfig().currentUserName;
  if (!userName) throw new Error("No user logged in");

  const user = await getUser(userName);
  if (!user) throw new Error("User could not be found");

  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error("Feed could not be found");

  const newFollowFeed = await createFeedFollow(user.id, feed.id);
  if (!newFollowFeed) throw new Error("Feed could not be followed");

  console.log(`User ${newFollowFeed.userName} followed feed ${newFollowFeed.feedName}.`);
}
