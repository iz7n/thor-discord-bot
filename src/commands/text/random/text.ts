import { getText } from "$lib/y7";
import command from "$lib/discord/commands/text";

export default command(
  {
    desc: "Sends text from the best website on the internet: yyyyyyy.info",
    args: {},
  },
  async () => {
    try {
      const source = await getText();
      return source;
    } catch {
      return "So sad, looks like yyyyyyy.info is down ):";
    }
  },
);
