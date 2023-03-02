import { build, context } from 'esbuild';
import type {
  BuildContext, BuildOptions, Platform, ServeOptions, WatchOptions,
  Plugin, PluginBuild, Message, Location,
} from 'esbuild';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import postCssPlugin from 'esbuild-style-plugin';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';

import { join } from 'path';
import { Logger } from 'tslog';
import { config } from './build.config.js';

export type Entrypoint = {
  input: string;
  output: string;
};
export type Config = {
  servedir?: string;
  serveoutdir?: string;
  bundle: boolean;
  platform: Platform,
  entrypoints: Array<Entrypoint>;
};

export enum ModuleType {
  ESModule = 'esm',
  CommonJS = 'cjs',
};

enum MessageType {
  Warning,
  Error,
}
interface HandlerResult {
  type: MessageType;
  location: Location | null;
  message: Message;
}

function HandlerSortPredicate(lhs: HandlerResult, rhs: HandlerResult): number {
  const lhsLocation = lhs.location;
  const rhsLocation = rhs.location;
  if (lhsLocation === null) {
    return -1;
  } else if (rhsLocation === null) {
    return 1;
  }

  if (lhsLocation.file < rhsLocation.file) {
    return -1;
  } else if (lhsLocation.file > rhsLocation.file) {
    return 1;
  }
  if (lhsLocation.line < rhsLocation.line) {
    return -1;
  } else if (lhsLocation.line > rhsLocation.line) {
    return 1;
  }
  if (lhsLocation.column < rhsLocation.column) {
    return -1;
  } else if (lhsLocation.column > rhsLocation.column) {
    return 1;
  }
  return 0;
}

function createMessageHandler(message: Message, messageType: MessageType): HandlerResult {
  const handlerResult: HandlerResult = {
    type: messageType,
    location: message.location,
    message,
  }
  return handlerResult;
}

function printMessages(messages: Array<HandlerResult>): void {
  messages.forEach((message) => {
    const location = message.message.location;
    const place = location === null ? 'unknown' : `${location.file}:${location.line}:${location.column}`;
    if (message.type === MessageType.Warning) {
      logger.warn(place, message.message.text);
    } else {
      logger.error(place, message.message.text);
    }
  });
}

const IterationPlugin: Plugin = {
  name: 'iteration-plugin',
  setup(build: PluginBuild): void | Promise<void> {
    build.onEnd(callback => {
      const errorHandlers = callback.errors.map(error => createMessageHandler(error, MessageType.Error));
      const warnHandlers = callback.warnings.map(warn => createMessageHandler(warn, MessageType.Warning));
      const messages = errorHandlers.concat(warnHandlers).sort(HandlerSortPredicate);

      printMessages(messages);
      logger.info('compile finished');
    });
  }
};

const logger = new Logger({ minLevel: 3 });

function createBuildOptions(
  entryPoints: Record<string, string>,
  module: ModuleType,
  platform: Platform = 'node',
  optimized: boolean = false,
  bundle: boolean = true,
): BuildOptions {

  const buildOptions: BuildOptions = {
    entryPoints,
    bundle: bundle,
    platform,
    format: module,
    minify: optimized,
    sourcemap: optimized,
    outdir: join(process.cwd(), 'dist'),
    outExtension: {
      '.js': module === ModuleType.ESModule ? '.mjs' : '.cjs',
    },
    outbase: 'src',
    preserveSymlinks: true,
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
    },
    treeShaking: optimized,
    plugins: [
      IterationPlugin,
      dtsPlugin({
        outDir: 'dist',
        tsconfig: 'tsconfig.json',
      }),
      typecheckPlugin({
        configFile: 'tsconfig.json',
        build: {
          preserveSymlinks: true,
          jsx: 'react-jsx',
        }
      }),
      postCssPlugin({
        postcss: {
          plugins: [
            tailwind(),
            autoprefixer(),
          ],
        }
      }),
    ]
  };

  return buildOptions;
}

function createContext(buildOptions: BuildOptions): Promise<BuildContext<BuildOptions>> {
  return context(buildOptions);
}

function getEntrypints(entrySource: Array<Entrypoint>): Record<string, string> {
  const result: Record<string, string> = {};
  entrySource.forEach((entry) => {
    result[entry.output] = entry.input;
  });

  return result;
}

async function main() {

  let buildContext: BuildContext<BuildOptions> | undefined;
  try {
    const args = process.argv.slice(-2);
    logger.debug('args', args);

    let isWatch = false;
    let isServe = false;
    let isEsm = false;

    for (const arg of args) {
      if (arg === 'watch') {
        isWatch = true;
      } else if (arg === 'serve') {
        isWatch = true;
        isServe = true;
      } else if (arg === 'esmodule') {
        isEsm = true;
      }
    }

    logger.debug('isWatch', isWatch, 'isServe', isServe, 'isEsm', isEsm);

    const entryPoints: Record<string, string> = getEntrypints(config.entrypoints);
    const platform: Platform = config.platform;

    const buildOptions = createBuildOptions(
      entryPoints,
      isEsm ? ModuleType.ESModule : ModuleType.CommonJS,
      platform,
      !isWatch);
    if (isServe) {
      buildOptions.outdir = config.serveoutdir ?? config.servedir ?? 'static';
      buildOptions.write = false;
    }

    logger.debug('buildOptions', buildOptions);

    if (isWatch || isServe) {
      buildContext = await createContext(buildOptions);
      if (isWatch) {
        const watchOptions: WatchOptions = {
        };
        await buildContext.watch(watchOptions);
      }
      if (isServe) {
        const serveOptions: ServeOptions = {
          servedir: config.servedir ?? 'static',
          host: 'localhost',
          port: 8888,
          onRequest: (args) => {
            logger.info('on request', args.method, args.path, args.status, args.timeInMS);
          },
        };
        const serveResult = await buildContext.serve(serveOptions);
        logger.info(`serve on http://${serveResult.host}:${serveResult.port}/`);
      }
    } else {
      const buildResult = await build(buildOptions);
      const errorHandlers = buildResult.errors.map(error => createMessageHandler(error, MessageType.Error));
      const warnHandlers = buildResult.warnings.map(warn => createMessageHandler(warn, MessageType.Warning));
      const messages = errorHandlers.concat(warnHandlers).sort(HandlerSortPredicate);

      printMessages(messages);
      logger.info('compile finished');

    }
  } catch (e) {
    logger.error(e);
    await buildContext?.dispose();
  }
}

main().catch(logger.error);
