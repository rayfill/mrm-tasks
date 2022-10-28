const { install, copyFiles, makeDirs, packageJson, lines, template } = require('mrm-core');
const { join } = require('path');

function task() {

  const depends = [
    'tslog',
  ];
  const devDepends = [
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
    'build.js',
    'src/index.ts',
  ]);

  const pkg = packageJson();
  pkg.setScript('build', 'node ./build.js')
    .setScript('watch', 'npm run build -- watch')
    .save();

  lines('.gitignore')
    .add('*~')
    .add('node_modules')
    .add('dist')
    .save();
}


module.exports = task;
module.exports.description = 'typescript project, using esbuild';
