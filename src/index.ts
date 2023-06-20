import "dotenv/config";
import { Client } from "revolt.js";

import { getResponse } from "./responses.js";
import { MINUTES } from "./constants.js";

const channelTimes = new Map<string, number>();
const client = new Client();

const setInitialTime = (id: string) => {
  channelTimes.set(id, Date.now());
};

client.on("ready", async () => {
  console.info(`Logged in as ${client.user?.username} ${new Date()}`);

  client.servers.forEach((server) => {
    server.channels?.forEach((channel) => {
      const id = channel?._id;

      if (!id) return;

      // if no last message is found, set it to the initial value
      if (!channel.last_message_id) {
        setInitialTime(channel._id);
        return;
      }

      // dont feel a need for async/await here
      channel
        .fetchMessage(channel.last_message_id)
        .then((message) => channelTimes.set(id, message.createdAt))
        .catch((err) => console.error(err.toString()));
    });
  });
});

client.on("message", async (message) => {
  // ignore messages from ourself
  if (message.author == client.user) {
    return;
  }

  const cid = message.channel_id;
  const lastTimestamp = channelTimes.get(cid);

  // set the time since the last message to the initial value
  setInitialTime(cid);

  if (lastTimestamp === undefined) {
    console.info(`Channel ${cid} not found in hashmap`);
    return;
  }

  // time since last message in minutes
  const diff = (Date.now() - lastTimestamp) / 1000 / 60;

  console.info(`Channel ${cid} was silent for ${diff.toFixed(1)} minutes`);

  if (diff < MINUTES) {
    console.info(
      `Message sent before time limit of ${MINUTES} minutes reached`
    );

    return;
  }

  message.channel?.sendMessage(`${getResponse()} ${diff.toFixed(1)} minutes`);
});

client.loginBot(process.env.BOT_TOKEN);
