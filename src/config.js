export const config = {
  port: Number(process.env.PORT || 8787),
  demoMode: String(process.env.DEMO_MODE || "true").toLowerCase() !== "false",
  openaiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  elevenLabsKey: process.env.ELEVENLABS_API_KEY || "",
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "",
  linkupKey: process.env.LINKUP_API_KEY || "",
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChannel: process.env.TELEGRAM_CHANNEL_ID || "",
};
