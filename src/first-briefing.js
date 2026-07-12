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
  let audioSent = false, audioMessageId;
  if (audioUrl) {
    let audioResponse;
    if (/^https?:\/\//.test(audioUrl)) audioResponse=await fetch(`${endpoint}/sendAudio`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chatId,audio:audioUrl,caption:"🎙️ Your latest personalized BulletNews audio briefing"})});
    else {
      const {readFile}=await import("node:fs/promises"),path=await import("node:path"),form=new FormData();
      form.set("chat_id",String(chatId));form.set("caption",`🎙️ ${briefing.stories.length}-story personalized BulletNews audio briefing`);form.set("audio",new Blob([await readFile(audioUrl)],{type:"audio/mpeg"}),path.basename(audioUrl));
      audioResponse=await fetch(`${endpoint}/sendAudio`,{method:"POST",body:form});
    }
    const audioResult=await audioResponse.json();audioSent=audioResponse.ok&&Boolean(audioResult.ok);audioMessageId=audioResult.result?.message_id;
  }
  return { sent: true, audioSent, messageId: result.result?.message_id, audioMessageId };
}
