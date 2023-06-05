import process from "node:process";
import { EmbedBuilder } from "discord.js";
import commands from "./mod";
import command, {
	argumentType2Name,
	type TextCommand,
} from "$services/commands/text";
import { COLOR } from "$services/env";

export default command(
	{
		aliases: ["h"],
		desc: "Shows help for a/all command(s)",
		args: {
			command: {
				type: "words",
				desc: "The command to show help for",
				optional: true,
			},
		},
	},
	async ({ message: { channel }, args: { command: arguments_ } }) => {
		if (!arguments_)
			return channel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${process.env.NAME} Commands`)
						.setDescription(
							Object.entries(commands)
								.map(([name, { aliases }]) =>
									[name, ...(aliases?.map(alias => alias) || [])].join("|")
								)
								.join(", ")
						)
						.setColor(COLOR),
				],
			});

		let commandManual: TextCommand | undefined;
		let commandManuals = commands;
		const usage: string[] = [];
		const commandNames = arguments_.map(argument => argument.toLowerCase());
		for (const command of commandNames) {
			commandManual = Object.entries(commandManuals).find(
				([name, { aliases }]) => name === command || aliases?.includes(command)
			)?.[1];
			if (!commandManual) {
				commandManual = undefined;
				break;
			}

			commandManuals = commandManual.subcommands || {};
			usage.push([command, ...(commandManual.aliases || [])].join("/"));
		}

		if (commandManual)
			usage.push(
				...Object.entries(commandManual.args).map(
					([name, { type, optional, default: default_ }]) =>
						`<${name}${optional ? "?" : ""}: ${argumentType2Name[type]}${
							default_ === undefined ? "" : ` = ${default_}`
						}>`
				)
			);
		else
			return channel.send(
				`No help found for command \`${arguments_.join(" ")}\``
			);

		const embed = new EmbedBuilder()
			.setTitle(`${process.env.NAME} Help: ${arguments_.join(" ")}`)
			.setDescription(commandManual.desc)
			.setColor(COLOR)
			.addFields({
				name: "Usage",
				value: `\`${process.env.PREFIX}${usage.join(" ")}\``,
			});
		if (commandManual.subcommands)
			embed.addFields({
				name: "Subcommands",
				value: Object.keys(commandManual.subcommands)
					.map(name => `\`${name}\``)
					.join(", "),
			});
		return channel.send({ embeds: [embed] });
	}
);
