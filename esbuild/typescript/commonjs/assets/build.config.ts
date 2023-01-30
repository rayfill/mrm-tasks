import { join } from 'path';
import { cwd } from 'process';
import { Config } from './build.js';

export const config: Config = {
  bundle: true,
  platform: 'node',
  serveoutdir: join(cwd(), 'static', 'js'),
  servedir: join(cwd(), 'static'),
  entrypoints: [
    {
      input: join(cwd(), 'src', 'index.ts'),
      output: 'index',
    },
  ]
}

