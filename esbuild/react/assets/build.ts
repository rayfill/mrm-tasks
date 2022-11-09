import { build, BuildOptions, Message, serve, ServeOptions } from 'esbuild';
import postCssPlugin from 'esbuild-style-plugin';
import { join } from 'path';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';

import { Logger, ISettingsParam } from 'tslog';

const logParams: ISettingsParam = {
  type: 'pretty',
  displayFunctionName: false,
  displayFilePath: 'hidden',
  displayLogLevel: false,
  displayLoggerName: false,
  minLevel: 'info',
};
const logger = new Logger(logParams);

const buildOptions: BuildOptions = {
  entryPoints: {
    index: join('src', 'main.tsx'),
//    style: join('src', 'css', 'tailwind.css'),
  },
  bundle: true,
  platform: 'browser',
  minify: true,
  sourcemap: true,
  outdir: join('dist', 'js'),
  plugins: [
    typecheckPlugin(),
    postCssPlugin({
      postcss: {
        plugins: [
          tailwind(),
          autoprefixer(),
        ],
      }
    }),
  ],
  treeShaking: true,
  jsx: 'transform',
};

async function Build() {
  const buildResult = await build({ ...buildOptions });
  buildResult.errors.forEach((error: Message) => {
    logger.error(error);
  });

  buildResult.warnings.forEach((warn: Message) => {
    logger.warn(warn);
  });

  if (buildResult.errors.length > 0) {
    logger.error('build failed');
  } else {
    logger.info(buildResult);
    logger.info('build succeeded');
    const artifacts = buildResult.outputFiles?.map(output => output.path);
    if (artifacts !== undefined) {
      logger.info(`output artifacts:`, artifacts);
    }
  }
}

async function Serve() {
  const serveOptions: ServeOptions = {
    port: 8888,
    servedir: 'static',
  };

  delete buildOptions.watch;
  delete buildOptions.outfile;
  buildOptions.outdir = join('static', 'js');
  buildOptions.incremental = true;
  buildOptions.minify = false;

  logger.debug('buildOptions', buildOptions);
  logger.debug('serveOptions', serveOptions);
  const serveResult = await serve(serveOptions, buildOptions);
  logger.info(`serving on http://${serveResult.host}:${serveResult.port}`);
  await serveResult.wait;
}

const args = process.argv.slice(-2);

const builder = ((args.length > 0 && args.slice(-1)[0] === 'serve') ? Serve() : Build());
builder
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => {
    logger.info('build process finished');
  });
