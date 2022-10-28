const { install, copyFiles, makeDirs, packageJson, lines } = require('mrm-core');
const { join } = require('path');

function task() {

  const devDepends = [
    'ts-node',
    'typescript',
    'jest',
    'ts-jest',
    '@types/jest',
  ];

  install(devDepends, { dev: true });

  const scriptDir = __dirname;
  const assetDir = join(scriptDir, 'assets');

  makeDirs([
    'test',
  ]);
  copyFiles(assetDir, [
    'jest.config.js'
  ]);

  const pkg = packageJson()
        .setScript('test', 'jest')
        .save();

}


module.exports = task;
module.exports.description = 'add jest configuration template and dependencies';
