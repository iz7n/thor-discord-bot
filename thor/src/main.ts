import client from './client';
import {
  ao3,
  chaos,
  cipher,
  cube,
  fractal,
  gif,
  graph,
  help,
  hex,
  hiragana,
  img,
  mast,
  members,
  noise,
  owo,
  pfp,
  ping,
  pixelsort,
  quest,
  random,
  ratio,
  react,
  sort,
  status,
  text,
  zen,
  wordle,
  rng,
  drive
} from './commands';
import { handleMessage } from './commands/wordle';
import './env';
import responses from './responses';

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const { content } = message;
  if (content.length === 5) await handleMessage(message);

  const args = message.content.split(' ');

  if (args[0]?.toLowerCase() !== process.env.PREFIX) {
    const msgs: string[] = [];
    let lowercase = content.toLowerCase();
    // Remove @mentions
    lowercase = lowercase.replace(/<@!?\d+>/g, '');
    if (lowercase.replace(' ', '') === 'noway') {
      await message.channel.send('no way');
      return;
    }
    if (
      message.channel.type !== 'DM' &&
      !message.channel.name.includes('thor')
    ) {
      if (message.channel.name.includes('general')) {
        if (Math.random() > 0.5) return;
      } else return;
    }

    for (const [words, msg] of responses.entries()) {
      const included = words.some(word => lowercase.includes(word));
      if (included) msgs.push(msg);
    }

    if (msgs.length) await message.channel.send(msgs.join(' '));
    return;
  }

  const params = args.slice(2);
  const command = args[1]?.toLowerCase();
  if (!command) return;
  try {
    switch (command) {
      case 'help':
        await help(message, params);
        break;
      case 'img':
      case 'pic':
        await img(message, params);
        break;
      case 'gif':
        await gif(message, params);
        break;
      case 'text':
        await text(message, params);
        break;
      case 'fractal':
        await fractal(message, params);
        break;
      case 'random':
        await random(message, params);
        break;
      case 'noise':
        await noise(message, params);
        break;
      case 'react':
        await react(message, params);
        break;
      case 'ping':
        await ping(message, params);
        break;
      case 'status':
        await status(message, params);
        break;
      case 'members':
        await members(message, params);
        break;
      case 'mast':
        await mast(message, params);
        break;
      case 'cube':
        await cube(message, params);
        break;
      case 'owo':
        await owo(message, params);
        break;
      case 'chaos':
        await chaos(message, params);
        break;
      case 'pixelsort':
        await pixelsort(message, params);
        break;
      case 'sort':
        await sort(message, params);
        break;
      case 'graph':
        await graph(message, params);
        break;
      case 'quest':
        await quest(message, params);
        break;
      case 'ao3':
        await ao3(message, params);
        break;
      case 'cipher':
        await cipher(message, params);
        break;
      case 'zen':
        await zen(message, params);
        break;
      case 'hex':
        await hex(message, params);
        break;
      case 'pfp':
        await pfp(message, params);
        break;
      case 'rng':
        await rng(message, params);
        break;
      case 'ratio':
        await ratio(message, params);
        break;
      case 'hiragana':
        await hiragana(message, params);
        break;
      case 'wordle':
        await wordle(message, params);
        break;
      case 'drive':
        await drive(message, params);
        break;
      default:
        await message.channel.send(
          Math.random() < 0.1 ? 'No.' : `IDK what ${command} is`
        );
    }
    client.user?.setActivity();
  } catch (err) {
    await message.channel.send(`Error ): ${err}`);
  }
});

client.login(process.env.TOKEN).then(() => client.user?.setActivity());

process.once('beforeExit', () => client.user?.setActivity());
