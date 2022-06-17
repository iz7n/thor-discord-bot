import { MessageAttachment } from 'discord.js';
import { createCanvas } from 'canvas';
import { clamp, randomInt, vec2, Vector2 } from '@limitlesspc/limitless';

import Progress from '../progress';
import { command } from '$shared/command';

const size = 1024;
const r = size / 2;
const itersPerFrame = 1000;
const frames = 1000;

export default command(
  {
    name: 'chaos',
    desc: 'Creates chaos',
    args: [
      {
        name: 'num points',
        type: 'int',
        desc: 'How many points to run with',
        default: 3
      },
      {
        name: 'stride',
        type: 'float',
        desc: 'How far to move towards a point',
        default: 0.5
      }
    ]
  },
  async ({ channel }, [n, s], client) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    const text = 'Creating chaos...';
    console.log(text);
    const msg = await channel.send(text);
    client.user?.setActivity(`something chaotic`);

    const numPts = clamp(n, 2, 16);
    const stride = clamp(s, 0, 1);

    const points: Vector2[] = [];
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / numPts) {
      const point = vec2(r, 0).setAngle(a).add(r);
      points.push(point);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);

    const progress = new Progress('Chaos', frames);
    const current = Vector2.random(size);
    for (let i = 0; i < frames; i++) {
      for (let j = 0; j < itersPerFrame; j++) {
        const index = randomInt(points.length);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const pt = points[index]!;

        current.lerp(pt, stride);

        ctx.fillStyle = `hsl(${index * (360 / points.length)},100%,50%)`;
        ctx.fillRect(current.x, current.y, 1, 1);
      }
      progress.inc();
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setImmediate(resolve));
    }

    console.log('Done');
    return msg.edit({
      content: null,
      files: [new MessageAttachment(canvas.toBuffer())]
    });
  }
);