const axios = require("axios");
const { DISCORD_WEBHOOK_URL } = process.env;

async function notifyDiscord(notices = []) {
  for (const notice of notices) {
    const payload = {
      content: `📢 **${notice.title}**\n🔗 ${notice.link}`,
    };

    try {
      await axios.post(DISCORD_WEBHOOK_URL, payload);
      console.log("Sent:", notice.title);
    } catch (err) {
      console.error("Discord error:", err.message);
    }
  }
}

module.exports = { notifyDiscord };
