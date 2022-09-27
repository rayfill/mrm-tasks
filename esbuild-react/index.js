const { install, copyFiles, makeDirs, packageJson, lines } = require('mrm-core');
const { join } = require('path');

function task() {

  const depends = [
    'tslog',
    'react',
    'react-dom',
  ];
  const devDepends = [
    '@types/node',
    '@types/react',
    '@types/react-dom',
    'esbuild',
    'esbuild-sass-plugin',
    'ts-node',
    'typescript',
    'eslint',
    'eslint-plugin-react-hooks',
    'eslint-plugin-import',
    'eslint-plugin-react',
    'eslint-plugin-react',
    'eslint-plugin-jsx-a11y',
    'eslint-config-prettier',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'prettier',
  ];

  install(depends, { dev: false });
  install(devDepends, { dev: true });

  const scriptDir = __dirname;
  const assetDir = join(scriptDir, 'assets');

  makeDirs([
    'src',
    'src/css',
    'dist',
    'static',
  ]);
  copyFiles(assetDir, [
    'build.ts',
    'src/main.tsx',
    'src/app.tsx',
    'src/css/root.css',
    'static/index.html',
    '.eslintrc.js',
    '.prettierrc.json',
  ]);

  const pkg = packageJson()
        .setScript('build', 'ts-node ./build.ts')
        .setScript('serve', 'npm run build serve')
        .setScript('lint', 'eslint .')
        .save();

  lines('.gitignore')
    .add('*~')
    .add('node_modules')
    .add('dist')
    .save();
}


module.exports = task;
module.exports.description = 'react project, using esbuild';
