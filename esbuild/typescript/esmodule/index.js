const { install, copyFiles, makeDirs, packageJson, lines, template } = require('mrm-core');
const { join } = require('path');

function task() {

  if (!require('fs').existsSync('./package.json')) {
    console.error(`package.json does not exists`);
    console.error(`task aborted`);
    return;
  }

  const depends = [
    'tslog',
  ];
  const devDepends = [
    '@jgoz/esbuild-plugin-typecheck',
    '@types/node',
    'esbuild',
    'esbuild-plugin-d.ts',
    'ts-node',
    'typescript',
  ];

  install(depends, { dev: false });
  install(devDepends, { dev: true });

  const scriptDir = __dirname;
  const assetDir = join(scriptDir, 'assets');

  makeDirs([
    'src',
    'dist',
  ]);

  copyFiles(assetDir, [
    'src/index.ts',
  ], { overwrite: false });
  copyFiles(assetDir, [
    'build.ts',
    'tsconfig.json',
  ]);
  copyFiles(assetDir, [
    'build.config.ts',
  ], { overwrite: false });

  const pkg = packageJson();
  pkg.merge({
    type: 'module',
    main: './dist/index.mjs',
    types: './dist/index.d.ts',
  });
  pkg
    .setScript('build', 'node --loader ts-node/esm ./build.ts esmodule')
    .setScript('watch', 'npm run build -- watch')
    .setScript('start', 'node --loader ts-node/esm src/index.ts')
    .save();

  lines('.gitignore')
    .add('*~')
    .add('node_modules')
    .save();
}


module.exports = task;
module.exports.description = 'typescript project, using esbuild';
