import { env } from "node:process";
import { Client } from "genius-lyrics";

const client = new Client(env.GENIUS_TOKEN);

export async function getLyrics(query: string): Promise<string> {
	const [song] = await client.songs.search(query);
	const lyrics = await song?.lyrics();
	return lyrics || "No lyrics found";
}
