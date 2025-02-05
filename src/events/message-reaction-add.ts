import db, { and, eq } from "$lib/database/drizzle";
import { youtubeSearches } from "$lib/database/schema";
import event from "$lib/discord/event";
import { YouTubeSong } from "$src/music/songs";
import { getVoice } from "$src/music/voice-manager";
import { includesAny } from "@iz7n/std/array";
import { EmbedBuilder, hyperlink, messageLink } from "discord.js";
import { env } from "node:process";

const numberEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

export default event(
  { name: "messageReactionAdd" },
  async ({ args: [{ message, emoji }, user] }) => {
    console.log(user);
    if (user.bot) {
      return;
    }

    console.log(user.dmChannel, emoji.name);

    const { guild, channel, channelId, author, attachments } = message;
    if (guild) {
      const numberIndex = numberEmojis.indexOf(emoji.name || "");
      if (numberIndex !== -1) {
        const search = await db.query.youtubeSearches.findFirst({
          columns: {
            ids: true,
          },
          where: and(
            eq(youtubeSearches.guildId, guild.id),
            eq(youtubeSearches.channelId, channelId),
            eq(youtubeSearches.messageId, message.id),
          ),
        });
        if (search) {
          const id = search.ids.split(",")[numberIndex];
          const member = await guild.members.fetch(user.id);
          if (id && member.voice.channel) {
            const voice = getVoice(guild.id);
            if (message.partial) {
              message = await message.fetch();
            }
            voice.setChannels(message);
            const song = await YouTubeSong.fromId(id);
            song.requester = {
              uid: user.id,
              name: member.displayName,
            };
            voice.queue.push(song);
            await voice.play();
          }
        }
      } else if (emoji.name === "🔖" && user.dmChannel) {
        const embed = new EmbedBuilder();
        if (author) {
          embed.setTitle(author.displayName).setAuthor({
            name: author.displayName,
            iconURL: author.defaultAvatarURL,
          });
        }
        embed
          .setTitle(`Bookmark from ${guild.name}`)
          .setDescription(message.content)
          .setTimestamp(message.createdAt);
        if (attachments.size) {
          const firstAttactment = attachments.first();
          if (
            attachments.size === 1 &&
            firstAttactment &&
            includesAny(
              [firstAttactment.name.split(".").at(-1)],
              ["png", "jpg", "webp"],
            )
          ) {
            embed.setImage(firstAttactment.proxyURL);
          } else {
            embed.addFields({
              name: "Attachments",
              value: [...attachments.values()]
                .map(x => hyperlink(x.name, x.proxyURL))
                .join("\n"),
            });
          }
        }
        embed.addFields({
          name: "Source",
          value: hyperlink(
            "[Jump to message]",
            messageLink(channelId, message.id, guild.id),
          ),
        });

        const bookmarkMessage = await user.dmChannel.send({
          embeds: [embed],
        });
        await bookmarkMessage.pin();
        await bookmarkMessage.react("❌");
      }
    }

    if (
      channel.isDMBased() &&
      emoji.name === "❌" &&
      message.author?.id === env.DISCORD_ID
    ) {
      await message.delete();
    }

    if (user.id === env.OWNER_ID) {
      await message.react(emoji);
    }
  },
);
