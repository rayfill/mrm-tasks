import { build, BuildOptions, Message, serve, ServeOptions, OnResolveArgs, Plugin, PluginBuild } from 'esbuild';
import postCssPlugin from 'esbuild-style-plugin';
import { join } from 'path';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { typecheckPlugin } from '@jgoz/esbuild-plugin-typecheck';
import { dtsPlugin } from 'esbuild-plugin-d.ts';

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

function ModuleAliasPlugin(config: Record<string, string>): Plugin {
  const plugin: Plugin = {
    name: 'module-alias-plugin',
    setup: (build: PluginBuild): void => {
      Object.keys(config).forEach((moduleName) => {
        const moduleTarget = config[moduleName];
        const filter = new RegExp(`^${moduleName}(?:\\/.*)?$`);
        const namespace = 'module-alias-plugin-resolve';

        build.onResolve({ filter }, (args: OnResolveArgs) => {
          if (args.resolveDir === '') {
            return undefined;
          }

          return {
            path: args.path,
            namespace,
            pluginData: {
              resolveDir: args.resolveDir,
              moduleName,
            }
          }
        });
        build.onLoad({ filter, namespace }, async (args) => {
          const replaceModulePath = args.path.replace(args.pluginData.moduleName, moduleTarget);
          const importerCode = `export * from '${replaceModulePath}';\n`;
          const defaultImporterCode = `export { default } from '${replaceModulePath}';\n`;
          return import(`${moduleName}`).then((symbols) => {
            const hasDefault = 'default' in symbols;
            const contents = hasDefault ? importerCode + defaultImporterCode : importerCode;
            return { contents: contents, resolveDir: args.pluginData.resolveDir };
          }).catch((err) => {
            console.log('error', err);
            return undefined;
          });
        });
      });
    }
  }
  return plugin;
}

const buildOptions: BuildOptions = {
  entryPoints: {
    index: join('src', 'main.tsx'),
  },
  bundle: true,
  platform: 'browser',
  minify: true,
  sourcemap: true,
  outdir: join('dist', 'js'),
  plugins: [
    ModuleAliasPlugin({
      'react': `${process.cwd()}/node_modules/react`,
    }),
    dtsPlugin(),
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
