import Parser from "rss-parser";

const parser = new Parser();

const feeds = [
  {
    id: "bbc",
    name: "BBC World",
    url: "http://feeds.bbci.co.uk/news/world/rss.xml",
  },
  {
    id: "reuters",
    name: "Reuters Top News",
    url: "http://feeds.reuters.com/reuters/topNews",
  },
  {
    id: "ap",
    name: "AP Top News",
    url: "https://feeds.apnews.com/apf-topnews",
  }
];

async function fetchFeed(feed) {
  const data = await parser.parseURL(feed.url);
  return data.items.map((item) => ({
    title: item.title,
    link: item.link,
    source: feed.name,
    sourceId: feed.id,
    publishedAt: item.isoDate || item.pubDate || null,
    description: item.contentSnippet || "",
  }));
}

export default async function handler(req, res) {
  const sourceId = req.query.source || null;

  try {
    const active = feeds.filter((f) => !sourceId || f.id === sourceId);
    const result = await Promise.all(active.map(fetchFeed));

    const articles = result
      .flat()
      .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

    res.status(200).json({
      articles,
      lastUpdated: Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load news", details: err.message });
  }
}
