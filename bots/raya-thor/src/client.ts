import { randomInt } from '@in5net/limitless';
import {
  ActivityOptions,
  ActivityType,
  Client,
  Options,
  WebhookClient
} from 'discord.js';
import { RecurrenceRule, scheduleJob } from 'node-schedule';
import { getCatboyEmbed } from './commands/catboy';

const { NAME, DISCORD_TOKEN } = process.env;
console.log(`⏳ ${NAME} is starting...`);
console.time(NAME);

const activity: ActivityOptions = {
  name: 'with your feelings',
  type: ActivityType.Playing
};

const client = new Client({
  presence: {
    activities: [activity]
  },
  intents: [
    'Guilds',
    'GuildMessages',
    'DirectMessages',
    'MessageContent',
    'GuildMessageReactions',
    'GuildVoiceStates'
  ],
  makeCache: Options.cacheWithLimits({
    ApplicationCommandManager: 0,
    BaseGuildEmojiManager: 0,
    GuildEmojiManager: 0,
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: 0
  })
});
export default client;

const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL || '' });

client
  .once('ready', async () => {
    console.timeEnd(NAME);
    console.log(`✅ ${NAME} is ready!`);
    await webhook.send(`✅ ${NAME} is online`);
  })
  .login(DISCORD_TOKEN);

process
  .on('exit', () => console.log(`🚫 ${NAME} is going offline...`))
  .on('SIGINT', async () => {
    await webhook.send(`🚫 ${NAME} is offline`);
    process.exit(0);
  });

scheduleJob(
  {
    hour: 4 + 12,
    minute: 20,
    tz: 'America/New_York'
  },
  () => webhook.send('420 BLAZE IT!!! 🔥🔥🔥')
);
scheduleJob(
  {
    hour: 12,
    minute: 0,
    tz: 'America/New_York'
  },
  () => webhook.send("it's high noon ☀️🤠")
);
scheduleJob(
  {
    hour: 7 + 12,
    minute: 0,
    tz: 'America/New_York'
  },
  () => webhook.send('alarm time ●_●')
);
scheduleJob(
  {
    minute: 0,
    tz: 'America/New_York'
  },
  () => {
    client.user?.setActivity('its 7:00 somewhere');
    setTimeout(() => client.user?.setActivity(activity), 60_000);
  }
);

const randomCatboyScheduleRule = new RecurrenceRule();
randomCatboyScheduleRule.dayOfWeek = 0;
randomCatboyScheduleRule.tz = 'America/New_York';
randomizeCatboySchedule();
function randomizeCatboySchedule() {
  randomCatboyScheduleRule.hour = randomInt(24);
  randomCatboyScheduleRule.minute = randomInt(60);
}
const randomCatboySchedule = scheduleJob(randomCatboyScheduleRule, async () => {
  const embed = await getCatboyEmbed();
  await webhook.send({ embeds: [embed] });
  randomizeCatboySchedule();
  randomCatboySchedule.reschedule(randomCatboyScheduleRule);
});