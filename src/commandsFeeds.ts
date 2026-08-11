import { fetchFeed } from "./parseRSS";
import { getUser, getUserById } from "./lib/db/queries_users";
import { createFeed, getAllFeeds } from "./lib/db/querires_feeds";
import { readConfig } from "./config";

import type { CommandHandler } from "./comandRegistry";
import type { User, Feed } from "./lib/db/schema";
import { getCurrentUserDbRecord } from "./commandHelpers";

export async function handlerAggregateFeed(_cmdName: string, ...args: string[]): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(feed);
  for (const item of feed.channel.item) {
    console.log(item);
  }
}

export async function handlerAddFeed(_cmdName: string, name: string, url: string, ...args: string[]): Promise<void> {
  if (!name || !url) {
    throw new Error("Missing arguments, name and url are required");
  }

  const currentUserDb = await getCurrentUserDbRecord();
  const newFeed = await createFeed(name, url, currentUserDb.id);
  if (!newFeed) throw new Error("Feed creation failed");
  printFeed(newFeed, currentUserDb);
}

export async function handlerListFeeds(_cmdName: string, ...args: string[]): Promise<void> {
  const allFeeds = await getAllFeeds();
  for (const feed of allFeeds) {
    const creatorUser = await getUserById(feed.userId);
    if (!creatorUser) throw new Error("Getting creator of feed failed");
    printFeed(feed, creatorUser);
  }
}

export function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ${feed.name} from ${feed.url} created at ${feed.createdAt} by user ${user.name}`);
}
