import { fetchFeed } from "./parseRSS";
import { getUserById } from "./lib/db/queries_users";
import { createFeed, getAllFeeds, getNextFeedToFetch, markFeedFetched } from "./lib/db/queries_feeds";
import { createPost, getPostsForUser } from "./lib/db/queries_posts";

import type { User, Feed } from "./lib/db/schema";
import { createFeedFollow } from "./lib/db/queries_feed_follows";

export async function handlerAggregateFeed(_cmdName: string, timeBetweenReqs: string, ...args: string[]): Promise<void> {
  if (!timeBetweenReqs) {
    throw new Error("Missing argument, time_between_reqs required, format like 5s, 2m, 1h");
  }

  const msBetweenReqs = parseDuration(timeBetweenReqs);
  console.log(`Collecting feeds every ${timeBetweenReqs} = ${msBetweenReqs} ms`);

  scrapeFeeds().catch((err) => console.error(err));

  const intervalId = setInterval(
    () => scrapeFeeds().catch((err) => console.error(err)),
    msBetweenReqs);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(intervalId);
      resolve();
    });
  });
}

export async function handlerAddFeed(_cmdName: string, user: User, name: string, url: string, ...args: string[]): Promise<void> {
  if (!name || !url) {
    throw new Error("Missing arguments, name and url are required");
  }

  const newFeed = await createFeed(name, url, user.id);
  if (!newFeed) throw new Error("Feed creation failed");

  const newFeedFollow = await createFeedFollow(user.id, newFeed.id);
  if (!newFeedFollow) throw new Error("Feed follow creation failed");

  printFeed(newFeed, user);
}

export async function handlerListFeeds(_cmdName: string, ...args: string[]): Promise<void> {
  const allFeeds = await getAllFeeds();
  for (const feed of allFeeds) {
    const creatorUser = await getUserById(feed.userId);
    if (!creatorUser) throw new Error("Getting creator of feed failed");
    printFeed(feed, creatorUser);
  }
}

export async function handlerBrowsePosts(_cmdName: string, user: User, limit: string, ...args: string[]): Promise<void> {
  let maxPosts = 2;
  try {
    maxPosts = parseInt(limit, 10);
  } catch {
    console.log(`maxPosts set to default value (${maxPosts})`);
  }
  const posts = await getPostsForUser(user.id, maxPosts);

  console.log(`Posts fetched for user ${user.name}:`);
  for (const post of posts) {
    console.log(`${post.title} (${post.url})`);
    console.log(post.description);
    console.log(`Published at ${post.publishedAt}`);
    console.log();
  }
}

export function printFeed(feed: Feed, user: User): void {
  console.log(`Feed ${feed.name} from ${feed.url} created at ${feed.createdAt} by user ${user.name}`);
}

async function scrapeFeeds(): Promise<void> {
  const nextFeed = await getNextFeedToFetch();
  if (!nextFeed) throw new Error("No feed to fetch found");

  const feedContent = await fetchFeed(nextFeed.url);
  const success = await markFeedFetched(nextFeed.id);
  if (!success) throw new Error(`Feed ${nextFeed.name} at ${nextFeed.url} could not be marked as fetched.`);

  for(const item of feedContent.channel.item) {
    let publishedDate = new Date(item.pubDate);
    if (!publishedDate)
      publishedDate = new Date();
    const newPost = await createPost(item.title, item.link, item.description, publishedDate, nextFeed.id);
    if (!newPost) console.log(`Post ${item.title} from ${item.link} could not be saved`);
  }

  console.log(feedContent.channel.title);
  for (const item of feedContent.channel.item) {
    console.log(`- ${item.title}`);
  }
}

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match || match.length < 3) {
    throw new Error("Invalid time interval format");
  }
  let durationInMs = parseInt(match[1], 10);
  switch(match[2]) {
    case "h":
      durationInMs *= 60; // h -> min
      /* fallthrough */
    case "m":
      durationInMs *= 60; // min -> s
      /* fallthrough */
    case "s":
      durationInMs *= 1000;
      break;
    case "ms":
      break;
    default:
      break;
  }
  return durationInMs;
}
