import command from '$commands/slash';
import prisma from '$services/prisma';
import { sendFile } from './shared';

export default command(
  {
    desc: 'Search for a file',
    options: {
      file: {
        type: 'string',
        desc: 'The file name to search for',
        autocomplete: async search => {
          const files = await prisma.file.findMany({
            select: {
              id: true,
              base: true
            },
            where: {
              base: {
                contains: search
              }
            },
            orderBy: {
              base: 'asc'
            },
            take: 5
          });
          return Object.fromEntries(files.map(({ id, base }) => [id, base]));
        }
      }
    }
  },
  async (i, { file }) => {
    const fileData = await prisma.file.findUnique({
      where: {
        id: BigInt(file)
      }
    });
    if (!fileData) return i.reply('No file found');
    return sendFile(i, fileData);
  }
);