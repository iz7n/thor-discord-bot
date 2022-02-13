import type Command from './command';

const cipher: Command = async (message, [subcmd, offsetStr = '', ...words]) => {
  const { channel } = message;
  const offset = parseInt(offsetStr);
  if (isNaN(offset)) return channel.send('Must provide an offset');

  const text = words.join(' ');
  if (!text) return channel.send('Must provide a message');

  switch (subcmd) {
    case 'encrypt':
      return channel.send(encrypt(text, offset));
    case 'iencrypt':
      await message.delete();
      return channel.send(encrypt(text, offset));
    case 'decrypt':
      return channel.send(decrypt(text, offset));
    default:
      return channel.send(`IDK what cipher ${subcmd} is`);
  }
};
export default cipher;

const spaceCode = ' '.charCodeAt(0);
const tildeCode = '~'.charCodeAt(0);
const codeRange = tildeCode - spaceCode;

export function encrypt(message: string, offset: number) {
  const codes = message.split('').map((char, i) => {
    const code = char.charCodeAt(0);
    const codeFromSpace = code - spaceCode;
    const encryptedCode = codeFromSpace + offset + (offset > 0 ? i : -i);
    return mod(encryptedCode, codeRange) + spaceCode;
  });
  return String.fromCharCode(...codes);
}
export function decrypt(message: string, offset: number) {
  return encrypt(message, -offset);
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
