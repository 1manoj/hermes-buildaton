export async function resilientPublication(draft, voice, sendText, sendAudio) {
  const base = { publishedAt: new Date().toISOString(), headline: draft.headline, text: draft.script, audioUrl: voice.audioUrl };
  if (!sendText) return { ...base, status: "preview", channel: "dashboard" };
  try {
    const telegram = await sendText();
    let audioMessage = null;
    if (voice.audioUrl && sendAudio) audioMessage = await sendAudio();
    return { ...base, status: "published", channel: "telegram", telegramMessageId: telegram?.message_id, telegramAudioMessageId: audioMessage?.message_id };
  } catch (error) {
    return { ...base, status: "published-with-warning", channel: "dashboard", deliveryWarning: `Telegram delivery pending: ${error.message}` };
  }
}
