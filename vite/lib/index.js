const { install, copyFiles, makeDirs, packageJson, lines } = require('mrm-core');
const { join } = require('path');

function task() {

  if (!require('fs').existsSync('./package.json')) {
    console.error(`package.json does not exists`);
    console.error(`task aborted`);
    return;
  }

  const depends = [
  ];
  const devDepends = [
    '@types/node',
    'typescript',
    'vite',
    'vite-plugin-banner',
  ];

  install(depends, { dev: false });
  install(devDepends, { dev: true });

  const scriptDir = __dirname;
  const assetDir = join(scriptDir, 'assets');

  makeDirs([
    'src',
  ]);
  copyFiles(assetDir, [
    '.gitignore',
    'tsconfig.json',
    'vite.config.ts',
    'src/index.ts',
    'src/vite-env.d.ts',
  ], { overwrite: false });
  //copyFiles(assetDir, [
  //], { overwrite: true });

  const pkg = packageJson();

  pkg.merge({
    type: 'module',
    private: true,
    scripts: {
      'dev': 'vite build --watch',
      'build': 'tsc && vite build',
    }
  }).save();

  lines('.gitignore')
    .add('# Logs')
    .add('logs')
    .add('*.log')
    .add('npm-debug.log*')
    .add('yarn-debug.log*')
    .add('yarn-error.log*')
    .add('pnpm-debug.log*')
    .add('lerna-debug.log*')
    .add('')
    .add('node_modules')
    .add('dist')
    .add('dist-ssr')
    .add('*.local')
    .add('')
    .add('# Editor directories and files')
    .add('.vscode/*')
    .add('!.vscode/extensions.json')
    .add('.idea')
    .add('.DS_Store')
    .add('*.suo')
    .add('*.ntvs*')
    .add('*.njsproj')
    .add('*.sln')
    .add('*.sw?')
    .add('')
    .add('*~')
    .save();
}


module.exports = task;
module.exports.description = 'react project, using esbuild';
