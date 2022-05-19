import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

import { DATABASE_PATH } from './path';

export default class SimpleJSONStorage<T extends Record<string, any>> {
  private path: string;
  private data: T;

  constructor(readonly name: string) {
    this.path = join(DATABASE_PATH, `${name}.json`);
    const str = readFileSync(this.path, 'utf8');
    this.data = JSON.parse(str);
  }

  save() {
    const str = JSON.stringify(this.data);
    writeFileSync(this.path, str, 'utf8');
  }

  get(): T {
    return this.data;
  }

  update(updater: (data: T) => T) {
    this.data = updater(this.data);
    this.save();
  }
}
