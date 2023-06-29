import { loadMessageCommands } from "discord/loaders/message-commands";
import { loadSlashCommands } from "discord/loaders/slash-commands";
import { loadTextCommands } from "discord/loaders/text-commands";

const textCommandsPath = new URL("commands/text", import.meta.url).pathname;
export const textCommands = await loadTextCommands(textCommandsPath);
const slashCommandsPath = new URL("commands/slash", import.meta.url).pathname;
export const slashCommands = await loadSlashCommands(slashCommandsPath);
const messageCommandsPath = new URL("commands/message", import.meta.url)
	.pathname;
export const messageCommands = await loadMessageCommands(messageCommandsPath);
