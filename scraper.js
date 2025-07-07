const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const { TARGET_URL, KEYWORDS } = process.env;

// Create HTTPS agent that skips SSL verification
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function fetchNotices() {
  try {
    const res = await axios.get(TARGET_URL, { httpsAgent });
    const $ = cheerio.load(res.data);
    const notices = [];

    $("a").each((i, el) => {
      const text = $(el).text().toLowerCase();
      const href = $(el).attr("href");

      const found = KEYWORDS.split(",").some((kw) => text.includes(kw.trim().toLowerCase()));
      if (found && href) {
        notices.push({
          title: $(el).text().trim(),
          link: new URL(href, TARGET_URL).href,
        });
      }
    });

    return notices;
  } catch (err) {
    console.error("Scraper error:", err.message);
    return [];
  }
}

module.exports = { fetchNotices };
