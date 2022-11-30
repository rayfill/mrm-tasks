import { build, BuildFailure, BuildOptions, BuildResult, WatchMode } from 'esbuild';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';
import { dtsPlugin } from 'esbuild-plugin-d.ts';
import { join } from 'path';
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

enum ModuleType {
  ESModule = 'esm',
  CommonJS = 'cjs',
}
function createBuildOptions(module: ModuleType, watch: boolean): BuildOptions {

  const entryPoint: Record<string, string> = {};
  entryPoint[`index.${module}`] = join('src', 'index.tsx');

  const watchOptions: WatchMode = {
    onRebuild: (error: BuildFailure | null, result: BuildResult | null): void => {
      if (error !== null) {
        error.errors.forEach((error) => {
          logger.error(error);
        });
        error.warnings.forEach((warn) => {
          logger.warn(warn);
        });
      } else if (result !== null) {
        result.errors.forEach((error) => {
          logger.error(error);
        });
        result.warnings.forEach((warn) => {
          logger.warn(warn);
        });
      }
    }
  }
  const buildOptions: BuildOptions = {
    entryPoints: entryPoint,
    bundle: false,
    platform: 'node',
    format: module,
    minify: !watch,
    sourcemap: true,
    outfile: join('dist', `index.${module === ModuleType.ESModule ? 'mjs' : 'cjs'}`),
    treeShaking: true,
    watch: watch,
    plugins: [
      dtsPlugin(),
      typecheckPlugin(),
    ]
  };

  return buildOptions;
}

async function Watch(module: ModuleType) {
  const buildOptions = createBuildOptions(module, true);
  doBuild(buildOptions);
}

async function Build(module: ModuleType) {
  const buildOptions = createBuildOptions(module, false);
  doBuild(buildOptions);
}

async function doBuild(buildOptions: BuildOptions) {
  const buildResult = await build(buildOptions);
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
let isWatch = false;
let isEsm = false;

for (const arg of args) {
  if (arg === 'watch') {
    isWatch = true;
  } else if (arg === 'esmodule') {
    isEsm = true;
  }
}

const builder = isWatch ? Watch : Build;
builder(isEsm ? ModuleType.ESModule : ModuleType.CommonJS)
  .catch((error) => {
    logger.error(error);
  })
  .finally(() => {
    logger.info('build process finished');
  });
