export default function handler(req, res) {
  res.status(200).json([
    {
      id: "bbc",
      name: "BBC World",
      url: "http://feeds.bbci.co.uk/news/world/rss.xml"
    },
    {
      id: "reuters",
      name: "Reuters Top News",
      url: "http://feeds.reuters.com/reuters/topNews"
    },
    {
      id: "ap",
      name: "AP Top News",
      url: "https://feeds.apnews.com/apf-topnews"
    }
  ]);
}
