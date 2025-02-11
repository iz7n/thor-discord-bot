import { parseTime } from "$lib/time";
import musicCommand from "./command";

export default musicCommand(
  {
    desc: "Go to a specific time in the current song",
    args: {
      time: {
        type: "word",
        desc: "The time to seek to (HH?:MM?:SS)",
      },
    },
    permissions: ["vc"],
    examples: ["1:30"],
  },
  async ({ message, args: { time }, voice }) => {
    const seconds = parseTime(time);
    const { queue } = voice;
    if (!queue?.current && "send" in message.channel) {
      return message.channel.send("No song is playing");
    }

    return voice.seek(seconds);
  },
);
