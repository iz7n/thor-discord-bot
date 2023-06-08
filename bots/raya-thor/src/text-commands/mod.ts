import { type TextCommand } from "discord/commands/text";
import boss from "./boss";
import chat from "./chat";
import google from "./google";
import musicCommands from "./music/mod";
import palm from "./palm";
import rtx from "./rtx";
import ry from "./ry";
import video from "./video";
import wordle from "./wordle";

const commands = {
	...musicCommands,
	boss,
	chat,
	google,
	palm,
	rtx,
	ry,
	wordle,
	video,
} as unknown as Record<string, TextCommand>;
export default commands;
