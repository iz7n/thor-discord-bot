import {
  bubble,
  cocktail,
  comb,
  cycle,
  gnome,
  heap,
  insertion,
  map,
  max,
  merge,
  objectKeys,
  pause,
  quick,
  randomInt,
  selection,
  shell,
  swap
} from '@in5net/limitless';
import { createCanvas } from '@napi-rs/canvas';
import { AttachmentBuilder } from 'discord.js';
import ffmpeg from 'fluent-ffmpeg';
import { nanoid } from 'nanoid';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import command from '$commands/slash';

const size = 512;
const algorithms = {
  bubble,
  cocktail,
  comb,
  cycle,
  gnome,
  heap,
  insertion,
  merge,
  quick,
  selection,
  shell
};

export default command(
  {
    desc: 'Sorts a random array of numbers',
    options: {
      algorithm: {
        type: 'choice',
        desc: 'The algorithm to use',
        choices: objectKeys(algorithms),
        default: 'quick'
      },
      length: {
        type: 'int',
        desc: 'The length of the array to sort',
        default: 50,
        min: 2,
        max: 2500
      },
      iterations_per_frame: {
        type: 'int',
        desc: 'The number of iterations to perform per frame',
        default: 1,
        min: 1,
        max: 100
      },
      opacity: {
        type: 'float',
        desc: 'The opacity of the background, 0-1',
        default: 1,
        min: 0,
        max: 1
      },
      show_shuffle: {
        type: 'bool',
        desc: 'Whether to show the shuffle animation',
        default: false
      }
    }
  },
  async (
    i,
    { algorithm, length, iterations_per_frame, opacity, show_shuffle }
  ) => {
    if (
      ['bubble', 'cocktail', 'cycle', 'selection'].includes(algorithm) &&
      length > 50
    )
      return i.reply('This algorithm is very slow for large arrays 💀');
    if (['gnome', 'insertion'].includes(algorithm) && length > 200)
      return i.reply('This algorithm is kinda slow for large arrays 💀');
    await i.deferReply();
    let active: number[] = [];
    let j = 0;

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    const tmpDir = join(tmpdir(), nanoid());
    await mkdir(tmpDir);

    const randomNumberArr = new Array(length).fill(0).map((_, i) => i + 1);
    const m = max(randomNumberArr);

    if (show_shuffle) await render();
    for (const [i, j] of shuffle(randomNumberArr)) {
      if (show_shuffle) {
        active = [i, j];
        await render();
        await pause(0);
      }
    }
    active = [];
    if (show_shuffle) {
      for (let i = 0; i < 30; i++) {
        await render();
        await pause(0);
      }
    }

    const iter = algorithms[algorithm](
      randomNumberArr,
      (a: number, b: number) => a - b
    );

    let next = iter.next();
    await render();
    while (!next.done) {
      for (let i = 0; i < iterations_per_frame; i++) {
        next = iter.next();
        active = next.value || [];
        await pause(0);
      }
      await render();
    }

    async function render() {
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fillRect(0, 0, size, size);

      const w = canvas.width / randomNumberArr.length;
      randomNumberArr.forEach((n, i) => {
        if (active.includes(i)) ctx.strokeStyle = ctx.fillStyle = '#f00';
        else ctx.strokeStyle = ctx.fillStyle = '#fff';

        const x = i * w;
        const y = map(n, 0, m, canvas.height, 0);
        const h = map(n, 0, m, 0, canvas.height);
        ctx.strokeRect(x, y, w, h);
        ctx.fillRect(x, y, w, h);
      });

      const path = join(
        tmpDir,
        `frame${(j++).toString().padStart(4, '0')}.png`
      );
      await writeFile(path, await canvas.encode('png'));
    }

    const name = `${algorithm}_sort_${length}.mp4`;
    await new Promise((resolve, reject) =>
      ffmpeg({ cwd: tmpDir })
        .input('frame%04d.png')
        .fps(60)
        .videoCodec('libx264')
        .outputOptions(['-pix_fmt yuv420p'])
        .save(name)
        .once('end', resolve)
        .once('error', reject)
    );

    const outputPath = join(tmpDir, name);
    const stream = createReadStream(outputPath);
    stream.once('close', () => rm(tmpDir, { recursive: true }));

    return i.editReply({
      files: [new AttachmentBuilder(stream, { name })]
    });
  }
);

export function* shuffle<T>(arr: T[]): Generator<[number, number]> {
  for (let i = 0, { length } = arr; i < length; i++) {
    const j = randomInt(i, length);
    swap(arr, i, j);
    yield [i, j];
  }
}