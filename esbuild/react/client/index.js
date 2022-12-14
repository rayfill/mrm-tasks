const { install, copyFiles, makeDirs, packageJson, lines } = require('mrm-core');
const { join } = require('path');

function task() {

  const depends = [
    'tslog@3.3.4',
    'react',
    'react-dom',
  ];
  const devDepends = [
    '@jgoz/esbuild-plugin-typecheck',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'autoprefixer',
    'esbuild',
    'esbuild-plugin-d.ts',
    'esbuild-style-plugin',
    'eslint',
    'eslint-plugin-react-hooks',
    'eslint-plugin-import',
    'eslint-plugin-react',
    'eslint-plugin-react',
    'eslint-plugin-jsx-a11y',
    'eslint-config-prettier',
    'postcss',
    'prettier',
    'tailwindcss',
    'ts-node',
    'typescript',
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
    'static/css',
  ]);
  copyFiles(assetDir, [
    '.eslintrc.js',
    '.prettierrc.json',
    'build.ts',
    'src/app.tsx',
    'src/main.tsx',
    'src/css/tailwind.css',
    'static/index.html',
    'tailwind.config.cjs',
    'tsconfig.json',
  ], { overwrite: false });

  const pkg = packageJson();

  pkg.merge({
    type: 'module',
  });
  pkg.setScript('build', 'node --loader ts-node/esm ./build.ts')
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
