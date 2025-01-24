import command from "$lib/discord/commands/slash";
import logger from "$lib/logger";
import { createEmbedBuilder } from "../embed";
import { type APIEmbedField } from "discord.js";
import Innertube from "youtubei.js";

export default command(
  {
    desc: "Search for YouTube videos",
    options: {
      query: {
        desc: "The search query to find videos",
        type: "string",
      },
      limit: {
        desc: "The maximum number of videos to return",
        type: "int",
        min: 1,
        max: 10,
        optional: true,
      },
    },
  },
  async (i, { query, limit }) => {
    try {
      const youtube = await Innertube.create();
      const search = await youtube.search(query, { type: "video" });
      const videos = search.videos.slice(0, limit);

      const fields: APIEmbedField[] = [];
      for (const [i, video] of videos.entries()) {
        fields.push({
          name: `${i + 1}. ${video.title.toString()}`,
          value: `https://youtu.be/${video.key("id").string()}`,
        });
      }

      const embed = createEmbedBuilder()
        .setTitle(`Search results for "${query}"`)
        .setURL(
          `https://www.youtube.com/results?search_query=${query
            .split(" ")
            .join("+")}`,
        )
        .addFields(fields);

      return i.reply({
        embeds: [embed],
      });
    } catch (error) {
      logger.error(error);
      throw new Error("Failed to search for YouTube videos");
    }
  },
);
