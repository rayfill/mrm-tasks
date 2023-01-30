import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';
import { build, BuildContext, BuildOptions, context, Platform, ServeOptions, WatchOptions } from 'esbuild';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
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
    loader: {
      '.png': 'dataurl',
      '.jpg': 'dataurl',
      '.jpeg': 'dataurl',
    },
    treeShaking: optimized,
    plugins: [
      dtsPlugin({
        outDir: 'dist',
        tsconfig: 'tsconfig.json',
      }),
      typecheckPlugin(),
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
      false);
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
        };
        const serveResult = await buildContext.serve(serveOptions);
        logger.info(`serve on http://${serveResult.host}:${serveResult.port}/`);
      }
    } else {
      const buildResult = await build(buildOptions);
    }
  } catch (e) {
    logger.error(e);
    await buildContext?.dispose();
  } finally {
    logger.info('build finshed');
  }
}

main().catch(logger.error);
