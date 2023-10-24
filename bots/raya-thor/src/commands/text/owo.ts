import command from "discord/commands/text";
import owofire from "owofire";

export default command(
	{
		desc: "Owoifies a message",
		args: {
			message: {
				type: "text",
				desc: "The message to owoify",
			},
		},
	},
	({ args: { message } }) => owofire(message),
);
