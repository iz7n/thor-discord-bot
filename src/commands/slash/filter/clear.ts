import { getVoice } from "$src/music/voice-manager";
import command from "$lib/discord/commands/slash";

export default command(
  {
    desc: "Clear song filter",
    options: {},
  },
  async i => {
    const { guildId } = i;
    if (!guildId) return;
    const voice = getVoice(guildId);

    await voice.setFilters();
    return i.reply("🎚️ Filters cleared");
  },
);
