import musicCommand from "./command";

export default musicCommand(
  {
    aliases: ["ps"],
    desc: "Adds and shuffles the queue",
    args: {
      queries: {
        name: "query",
        type: "text",
        desc: "The URLs or YouTube searches to play",
        optional: true,
      },
    },
    permissions: ["vc"],
    examples: ["https://youtu.be/dQw4w9WgXcQ terraria ost"],
  },
  async ({ message, args: { queries }, voice }) =>
    voice.add(message, queries, true),
);
