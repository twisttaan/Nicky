import "dotenv/config";

import { Client, Intents, Collection, Permissions } from "discord.js";
import { Message } from "discord.js";
import { Configuration, OpenAIApi } from "openai";

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    Intents.FLAGS.GUILD_VOICE_STATES,
    "GUILD_PRESENCES",
  ],
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("messageCreate", async (message: Message) => {
  if (message.channelId != "949957037536706610") return;
  if (message.author.bot) return;

  message.channel.sendTyping();

  const last10Messages = await message.channel.messages.fetch({ limit: 20 });
  const messages = last10Messages.map((msg) => `${msg.content}`).join("\n\n");

  const response = await openai.createCompletion("text-davinci-001", {
    prompt: message.content,
    temperature: 0,
    max_tokens: 64,
    top_p: 1,
    best_of: 50,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  if (!response.data.choices) return;

  if (response.data.choices.length > 0) {
    const choice = response.data.choices![0];
    if (!choice.text) return;
    message.reply(choice.text);
  }
});

client.once("ready", () => {
  console.log("Ready!");
});

client.login(process.env.DISCORD_TOKEN);
