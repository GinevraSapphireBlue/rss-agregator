import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    method: 'GET',
    headers: { "User-Agent": "gator" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed at ${feedURL}: ${response.status}`);
  }

  const xml = await response.text();
  const json = parseXML(xml);
  
  const rssFeed = getValidatedRSSFeed(json);
  const rssItems = getRSSFeedItems(json.rss);
  rssFeed.channel.item = rssItems;

  return rssFeed;
}

function parseXML(xml: string): any {
  const xmlParser = new XMLParser({ processEntities: false });
  return xmlParser.parse(xml);
}

function getValidatedRSSFeed(json: unknown): RSSFeed {
  if (!isRecord(json) || !isRecord(json.rss) || !isRecord(json.rss.channel)) {
    throw new Error("Object parsed from feed response is missing 'channel' field.");
  }

  const channel = json.rss.channel;
  if (!("title" in channel) || typeof channel.title !== "string") {
    throw new Error("Missing 'title' field inside 'channel'");
  }
  if (!("link" in channel) || typeof channel.link !== "string") {
    throw new Error("Missing 'link' field inside 'channel'");
  }
  if (!("description" in channel) || typeof channel.description !== "string") {
    throw new Error("Missing 'description' field inside 'channel'");
  }

  const { title, link, description } = channel;

  return {
    channel: {
      title,
      link,
      description,
      item: [],
    },
  };
}

function getRSSFeedItems(rss: unknown): RSSItem[] {  
  if (!isRecord(rss) || !isRecord(rss.channel)) {
    throw new Error("Object parsed from feed response is missing 'channel' field.");
  }
  if (!("item" in rss.channel))
    return [];

  let items: RSSItem[] = [];
  if (Array.isArray(rss.channel.item)) {
    for (const itemJson of rss.channel.item) {
      if (validateRSSItemFields(itemJson)) {
        items.push(itemJson);
      }
    }
  }
  else if (validateRSSItemFields(rss.channel.item)) {
    items.push(rss.channel.item);
  }

  return items;
}

function validateRSSItemFields(itemJson: unknown): itemJson is RSSItem {
  if (!isRecord(itemJson)) {
    return false;
  }

  return (
    typeof itemJson.title === "string" &&
    typeof itemJson.link === "string" &&
    typeof itemJson.description === "string" &&
    typeof itemJson.pubDate === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
