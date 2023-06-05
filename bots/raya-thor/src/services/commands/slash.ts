import type {
	APIInteractionDataResolvedChannel,
	Attachment,
	AutocompleteInteraction,
	Awaitable,
	ChatInputCommandInteraction,
	GuildBasedChannel,
	User,
} from "discord.js";

type Choice = number | string;

export interface CommandOptionType {
	string: string;
	int: number;
	float: number;
	bool: boolean;
	choice: Choice;
	user: User;
	channel: APIInteractionDataResolvedChannel | GuildBasedChannel;
	attachment: Attachment;
}
type Type = keyof CommandOptionType;

type Choices = readonly Choice[] | Record<string, Choice>;
type ValueFromChoices<T extends Choices> = T extends readonly Choice[]
	? T[number]
	: T[keyof T];

export type AutocompleteHandler = (
	option: string,
	i: AutocompleteInteraction
) => Promise<Choices>;
interface Option<T extends Type = Type, C extends Choices = Choices> {
	type: T;
	desc: string;
	min?: number;
	max?: number;
	choices?: C;
	optional?: boolean;
	default?: CommandOptionType[T];
	autocomplete?: AutocompleteHandler;
}
type Options = Record<string, Option>;

type ValueFromOption<T extends Option> = T["choices"] extends Choices
	? ValueFromChoices<T["choices"]>
	: CommandOptionType[T["type"]];
export type OptionValue<T extends Option = Option> =
	T["default"] extends CommandOptionType[Type]
		? ValueFromOption<T>
		: T["optional"] extends true
		? ValueFromOption<T> | undefined
		: ValueFromOption<T>;

type Handler<T extends Options = Options> = (
	i: ChatInputCommandInteraction,
	options: {
		[K in keyof T]: OptionValue<T[K]>;
	}
) => Awaitable<any>;

type Permission = "vc";
interface CommandOptions<T extends Options> {
	desc: string;
	options: T;
	permissions?: Permission[];
}
export interface Command<T extends Options = Options>
	extends CommandOptions<T> {
	handler: Handler<T>;
}
export type Commands = Record<string, Command>;
export type CommandGroups = Record<string, Commands>;

const command = <T extends Options>(
	options: CommandOptions<T>,
	handler: Handler<T>
): Command<T> => ({ ...options, handler });
export default command;
