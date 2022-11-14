const { install, copyFiles, makeDirs, packageJson, lines, template } = require('mrm-core');
const { join } = require('path');

function task() {

  const depends = [
    'tslog@3.4.4',
  ];
  const devDepends = [
    '@jgoz/esbuild-plugin-typecheck',
    '@types/node',
    'esbuild',
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

  const pkg = packageJson();
  pkg.merge({
    main: './dist/index.js',
    types: './dist/index.d.ts',
  });
  pkg
    .setScript('build:cjs', 'node --loader ts-node/esm ./build.ts')
    .setScript('postbuild', 'tsc -p ./tsconfig.json --emitDeclarationOnly')
    .setScript('watch', 'npm run build:esm -- watch')
    .save();

  lines('.gitignore')
    .add('*~')
    .add('node_modules')
    .save();
}


module.exports = task;
module.exports.description = 'typescript project, using esbuild';
