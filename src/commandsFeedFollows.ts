import { createFeedFollow } from "./lib/db/queries_feed_follows";
import { getFeedByUrl } from "./lib/db/querires_feeds";

import type { CommandHandler } from "./comandRegistry";
import type { feedFollows, Feed, User } from "./lib/db/schema";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries_users";
import { getCurrentUserDbRecord } from "./commandHelpers";

export async function handlerFollowFeed(_cmdName: string, url: string, ...args: string[]): Promise<void> {
  if (!url) {
    throw new Error("Missing argument, url is required");
  }

  const user = await getCurrentUserDbRecord();

  const feed = await getFeedByUrl(url);
  if (!feed) throw new Error("Feed could not be found");

  const newFollowFeed = await createFeedFollow(user.id, feed.id);
  if (!newFollowFeed) throw new Error("Feed could not be followed");

  console.log(`User ${newFollowFeed.userName} followed feed ${newFollowFeed.feedName}.`);
}
