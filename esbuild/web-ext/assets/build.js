const { build } = require('esbuild');
const copyStaticFiles = require('esbuild-copy-static-files');
const { join } = require('path');
const { Logger } = require('tslog');

const logParams = {
  type: 'pretty',
  displayFunctionName: false,
  displayFilePath: 'hidden',
  displayLogLevel: false,
  displayLoggerName: false,
  minLevel: 'info',
};
const logger = new Logger(logParams);

const buildOptions = {
  entryPoints: {
    background: join('src', 'background', 'index.ts'),
    content: join('src', 'content', 'index.ts'),
  },
  bundle: true,
  platform: 'browser',
  minify: true,
  sourcemap: true,
  outdir: join('dist', 'scripts'),
  treeShaking: true,
  plugins: [copyStaticFiles({
    src: './static',
    dest: './dist',
    recursive: true,
  })],
  watch: false,
};

async function Watch() {
  buildOptions.watch = true;
  Build();
}

async function Build() {
  const buildResult = await build({ ...buildOptions });
  buildResult.errors.forEach((error) => {
    logger.error(error);
  });

  buildResult.warnings.forEach((warn) => {
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


const args = process.argv.slice(-2);

const builder = ((args.length > 0 && args.slice(-1)[0] === 'watch') ? Watch() : Build());
builder
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => {
    logger.info('build process finished');
  });
