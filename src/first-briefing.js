const clean = value => String(value || "").trim();

export function selectPersonalizedStories(stories = [], profile = {}) {
  const topics = new Set((profile.topics || []).map(x => clean(x).toLowerCase()));
  return [...stories]
    .map((story, index) => ({ story, index, preferred: topics.has(clean(story.category).toLowerCase()) ? 1 : 0 }))
    .sort((a, b) => b.preferred - a.preferred || a.index - b.index)
    .slice(0, 5)
    .map(x => x.story);
}

export function buildFirstBriefing(user = {}, edition, limit = 5) {
  const stories = selectPersonalizedStories(edition?.stories || [], user).slice(0,Math.max(1,Math.min(5,limit)));
  if (!stories.length) {
    return {
      stories: [],
      text: `Welcome ${clean(user.name) || "to BulletNews"}. Your newsroom is configured. The latest verified edition is still being prepared; we’ll deliver it as soon as the Judge agent clears it.`,
    };
  }
  const blocks = stories.map((story, index) => {
    const summary = clean(story.shortSummary || story.summary || story.article).slice(0, 300);
    const source = clean(story.source) || "Verified source";
    return `${index + 1}. ${clean(story.title)}\n${summary}\n${source}: ${clean(story.url)}`;
  });
  return {
    stories,
    text: `📰 Your first BulletNews briefing${clean(user.name) ? `, ${clean(user.name)}` : ""}\n\n${blocks.join("\n\n")}\n\nYour preferences are saved. Connect Telegram to receive private updates and urgent watch alerts.`.slice(0, 4096),
  };
}

export async function sendTelegramBriefing(token, chatId, briefing, audioUrl) {
  if (!token || !chatId) return { sent: false, reason: "telegram-not-connected" };
  const endpoint = `https://api.telegram.org/bot${token}`;
  const response = await fetch(`${endpoint}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: briefing.text, disable_web_page_preview: true }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.description || `Telegram send failed (${response.status})`);
  let audioSent = false;
  if (audioUrl && /^https?:\/\//.test(audioUrl)) {
    const audioResponse = await fetch(`${endpoint}/sendAudio`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, audio: audioUrl, caption: "🎙️ Your latest BulletNews audio briefing" }),
    });
    audioSent = audioResponse.ok && Boolean((await audioResponse.json()).ok);
  }
  return { sent: true, audioSent, messageId: result.result?.message_id };
}
