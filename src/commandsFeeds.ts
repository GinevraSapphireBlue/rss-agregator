import { fetchFeed } from "./parseRSS";
import { getUser } from "./lib/db/queries_users";
import { createFeed } from "./lib/db/querires_feeds";
import { readConfig } from "./config";

import type { CommandHandler } from "./comandRegistry";
import type { User, Feed } from "./lib/db/schema";

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

  const currentUser = readConfig().currentUserName;
  if (!currentUser) {
    throw new Error("No user logged in");
  }
  const currentUserDb = await getUser(currentUser);
  if (!currentUserDb) {
    throw new Error("User could not be found");
  }

  const newFeed = await createFeed(name, url, currentUserDb.id);
  printFeed(newFeed, currentUserDb);
}

export function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ${feed.name} from ${feed.url} created at ${feed.createdAt} by user ${user.name}`);
}
