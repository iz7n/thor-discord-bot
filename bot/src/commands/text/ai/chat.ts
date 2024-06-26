import { filter, openai } from "$lib/openai";
import { cache } from "$lib/prisma";
import { throttle } from "@in5net/std/async";
import { ttlCache } from "@in5net/std/fn";
import { OpenAIStream as openAIStream } from "ai";
import { type Message } from "discord.js";
import command from "discord/commands/text";
import ms from "ms";
import { readFile } from "node:fs/promises";

const chatGPTSystemPath = new URL(
	"../../../../chatgpt-system.txt",
	import.meta.url,
);
const chatGPTDescPath = new URL(
	"../../../../chatgpt-desc.txt",
	import.meta.url,
);
const system = ttlCache(
	async () => readFile(chatGPTSystemPath, "utf8"),
	ms("10 min"),
);
const desc = ttlCache(
	async () => readFile(chatGPTDescPath, "utf8"),
	ms("10 min"),
);

export default command(
	{
		desc: "Talk to ChatGPT",
		optionalPrefix: true,
		args: {
			prompt: {
				type: "text",
				desc: "The prompt to send",
				max: 256,
			},
		},
		examples: ["hi", "what is the meaning of life?"],
	},
	async ({ message, args: { prompt } }) => {
		const channelId = BigInt(message.channelId);
		const { channel, author } = message;

		if (prompt === "CLEAR") {
			await cache.context.deleteMany({
				where: {
					channelId,
				},
			});
			return message.reply("Context cleared");
		}

		if (!(await filter(prompt)))
			return message.reply("Your text did not pass the content filter");

		const minCreatedAt = new Date();
		minCreatedAt.setMinutes(minCreatedAt.getMinutes() - 5);
		const previous = await cache.context.findMany({
			select: {
				question: true,
				answer: true,
			},
			where: {
				createdAt: {
					gte: minCreatedAt,
				},
				channelId: BigInt(message.channelId),
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 10,
		});

		const stream = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			stream: true,
			max_tokens: 1024,
			user: author.id,
			messages: [
				{
					role: "system",
					content: `${await system()} Current date: ${new Date().toDateString()}`,
				},
				{
					role: "assistant",
					content: await desc(),
				},
				...previous.flatMap(
					({ question: q, answer: a }) =>
						[
							{ role: "user", content: q },
							{ role: "assistant", content: a },
						] as const,
				),
				{ role: "user", content: prompt },
			],
		});

		let reply = "";
		let responseMessage: Message | undefined;
		const send = throttle(async () => {
			if (reply) {
				if (responseMessage) await responseMessage.edit(reply);
				else responseMessage = await channel.send(reply);
			}
		}, 500);
		openAIStream(stream, {
			async onToken(token) {
				reply += token;
				send();
			},
		});

		return cache.context.create({
			data: {
				channel: {
					connectOrCreate: {
						create: {
							id: channelId,
						},
						where: {
							id: channelId,
						},
					},
				},
				question: prompt,
				answer: reply,
			},
		});
	},
);
