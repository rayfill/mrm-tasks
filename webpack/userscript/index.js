const { install, copyFiles, makeDirs, packageJson, lines } = require('mrm-core');
const { join } = require('path');

function task() {

  const depends = [
    'jszip@3.9.1',
    'file-saver',
  ];
  const devDepends = [
    '@types/node',
    '@types/file-saver',
    'webpack',
    'webpack-cli',
    '@babel/core',
    '@babel/preset-env',
    'terser-webpack-plugin',
    'ts-loader',
    'typescript',
    'ts-node',
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
    'webpack.config.js',
    'gm.header',
    'tsconfig.json',
    'src/main.ts',
  ]);

  const pkg = packageJson()
        .setScript('build', 'webpack --mode production')
        .setScript('watch', 'webpack --mode development --watch')
        .save();

  lines('.gitignore')
    .add('*~')
    .add('node_modules')
    .add('dist')
    .save();
}


module.exports = task;
module.exports.description = 'react project, using esbuild';
