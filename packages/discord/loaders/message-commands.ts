import { join, parse } from "node:path";
import { Collection } from "discord.js";
import { pluralize } from "@in5net/limitless";
import logger from "logger";
import { type MessageCommand, isMessageCommand } from "../commands/message";
import { noTestGlob } from "./shared";

export async function loadMessageCommands(dirPath: string) {
	dirPath = dirPath.replaceAll("\\", "/");
	const globPattern = join(dirPath, "**/*.ts");
	const filePaths = await noTestGlob(globPattern);

	const commands = new Collection<string, MessageCommand>();

	for (const filePath of filePaths) {
		const subPath = filePath.replace(dirPath, "");
		const { name } = parse(subPath);

		const module = (await import(filePath)) as Record<string, unknown>;
		if (!("default" in module)) continue;
		const command = module.default;
		if (!isMessageCommand(command)) continue;

		commands.set(name, command);
	}

	logger.info(
		`Loaded ${commands.size} message ${pluralize("command", commands.size)}`
	);

	return commands;
}
