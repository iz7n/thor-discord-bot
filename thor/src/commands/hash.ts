import { createHash } from 'node:crypto';
import { createCanvas } from 'canvas';
import { MessageAttachment } from 'discord.js';

import type Command from './command';

const size = 16;
const zoom = 4;
const width = size * zoom;

const hash = createHash('sha256');

const cmd: Command = async ({ channel }, words) => {
  const input = words.join(' ');
  hash.update(input);
  const digest = hash.digest('hex');

  console.log(input, '->', digest);

  const canvas = createCanvas(width, width);
  const ctx = canvas.getContext('2d');

  digest.split('').forEach((char, i) => {
    const byte = parseInt(char, 16);
    for (let j = 0; j < 4; j++) {
      const index = i * 4 + j;
      const x = index % size;
      const y = Math.floor(index / size);
      const bit = (byte >> j) & 1;
      ctx.fillStyle = bit ? '#fff' : '#000';
      ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
    }
  });

  return channel.send({ files: [new MessageAttachment(canvas.toBuffer())] });
};
export default cmd;
