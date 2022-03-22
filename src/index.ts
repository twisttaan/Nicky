import { Client, Intents, Message } from "discord.js";
import "dotenv/config";
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
  if (message.channelId != process.env.NICK_CHANNEL) return;
  if (message.author.bot) return;

  message.channel.sendTyping();

  const last10Messages = await message.channel.messages.fetch({ limit: 20 });
  const messages = last10Messages
    .map((msg) => `${msg.member?.displayName}: ${msg.content}`)
    .join("\n");

  const response = await openai.createEdit("text-davinci-edit-001", {
    input: `
    ${messages}
    nick: 
    `,
    instruction:
      "Reply with what nick would say, nick is the super smart ai bot.",
    temperature: 0,
    top_p: 1,
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
