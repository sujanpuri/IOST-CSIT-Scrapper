require("dotenv").config();
const http = require("http");
const fs = require("fs");
const cron = require("node-cron");
const { fetchNotices } = require("./scraper");
const { notifyDiscord } = require("./notify");

const SEEN_FILE = "./seen.json";

// Load previous links
function loadSeenLinks() {
  try {
    return new Set(JSON.parse(fs.readFileSync(SEEN_FILE, "utf-8")));
  } catch {
    return new Set();
  }
}

// Save updated links
function saveSeenLinks(seenSet) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify([...seenSet]), "utf-8");
}

async function runScraper() {
  console.log("🔍 Checking for CSIT notices...");
  const seenLinks = loadSeenLinks();

  const notices = await fetchNotices();
  const newNotices = notices.filter((n) => !seenLinks.has(n.link));

  if (newNotices.length > 0) {
    await notifyDiscord(newNotices);
    newNotices.forEach((n) => seenLinks.add(n.link));
    saveSeenLinks(seenLinks);
  } else {
    console.log("No new CSIT notices.");
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Scraper running");
});


cron.schedule("*/5 * * * *", runScraper); // every 5 mins
runScraper(); // immediate run on start


server.listen(process.env.PORT || 3000);