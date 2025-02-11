import command from "$lib/discord/commands/slash";
import GL from "$lib/gl";
import { renderProgressBar } from "$lib/progress";
import { sleep } from "@in5net/std/async";
import { type Message, AttachmentBuilder } from "discord.js";
import { mat4 } from "gl-matrix";
import { nanoid } from "nanoid";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { env } from "node:process";
import { pipeline } from "node:stream/promises";

export default command(
  {
    desc: "Makes your profile or attachment spin on a cube",
    options: {
      image: {
        type: "attachment",
        desc: "The texture to spin on the cube",
        optional: true,
      },
      fps: {
        type: "int",
        desc: "The frames per second to render the cube",
        min: 1,
        max: 60,
        default: 12,
      },
      speed: {
        type: "float",
        desc: "The speed of the cube (rotations per second)",
        min: 0.25,
        max: 2,
        default: 0.5,
      },
      gif: {
        type: "bool",
        desc: "Whether to make a gif",
        default: false,
      },
    },
  },
  async (i, { image, fps, speed, gif }) => {
    await i.deferReply();
    const url =
      image?.url || i.user.displayAvatarURL({ extension: "png", size: 64 });

    const gl = new GL(180, 180, true);
    await gl.createProgramFromPaths(
      new URL("../../../assets/cube/shader.vert", import.meta.url).pathname,
      new URL("../../../assets/cube/shader.frag", import.meta.url).pathname,
    );

    gl.createVertexBuffer(GL.unitCubeTextured.vertexData);
    gl.createIndexBuffer(GL.unitCubeTextured.indexData);
    gl.attributes([
      { name: "position", type: "vec3" },
      { name: "uv", type: "vec2" },
    ]);

    await gl.createTexture(url, { isGif: image?.contentType === "image/gif" });

    const projectionMatrix = mat4.perspective(
      mat4.create(),
      Math.PI / 3,
      1,
      0.1,
      1000,
    );
    gl.uniform("projectionMatrix", "mat4", projectionMatrix);
    const modelViewMatrix = mat4.create();

    let angle = 0;

    async function render() {
      gl.background(0, 0, 0, 1);

      mat4.identity(modelViewMatrix);
      mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -4]);
      mat4.rotateY(modelViewMatrix, modelViewMatrix, angle);
      mat4.rotateX(modelViewMatrix, modelViewMatrix, angle);
      gl.uniform("modelViewMatrix", "mat4", modelViewMatrix);
      frame++;
      await sleep();
    }

    const renderStart = performance.now();
    const frames = (fps / speed) * 2;
    let frame = 0;
    let editPromise: Promise<Message<boolean>> | undefined;
    const progressHandle = setInterval(updateProgress, 1500);
    function updateProgress() {
      editPromise = i.editReply(
        `Rendering cube: \`${renderProgressBar({
          current: frame,
          total: frames,
        })}\``,
      );
    }

    const stream =
      gif ?
        await gl.gifStream(frames, {
          fps,
          async render(t) {
            angle = Math.PI * t * speed;
            return render();
          },
        })
      : await gl.mp4Stream(frames, {
          fps,
          lowres: true,
          audioPath: new URL("../../../assets/cube/cube.ogg", import.meta.url)
            .pathname,
          async render(t) {
            angle = Math.PI * t * speed;
            return render();
          },
        });
    const streamStart = performance.now();
    clearInterval(progressHandle);
    await editPromise;

    const extension = gif ? "gif" : "mp4";
    const subPath = `cubes/${nanoid()}.${extension}`;
    const filePath = path.join(env.FILES_PATH, subPath);
    await pipeline(stream, createWriteStream(filePath));

    const fileURL = `https://${env.FILES_DOMAIN}/${subPath}`;
    console.log(`Uploaded ${fileURL}`);
    const end = performance.now();

    return i.editReply({
      content: `Render time: ${Math.round(streamStart - renderStart)}ms
Upload time: ${Math.round(end - streamStart)}ms`,
      files: [new AttachmentBuilder(fileURL, { name: `cube.${extension}` })],
    });
  },
);
