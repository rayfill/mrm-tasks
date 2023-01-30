const { install, copyFiles, makeDirs, packageJson, lines } = require('mrm-core');
const { join } = require('path');

function task() {

  const depends = [
    'jszip@3.9.1',
    'file-saver',
    'react',
    'react-dom',
  ];
  const devDepends = [
    '@types/node',
    '@types/file-saver',
    '@types/react',
    '@types/react-dom',
    '@types/wicg-file-system-access',
    'webpack',
    'webpack-cli',
    '@babel/core',
    '@babel/preset-env',
    'terser-webpack-plugin',
    'ts-loader',
    'typescript',
    'ts-node',
    'css-loader',
    'postcss',
    'postcss-loader',
    'style-loader',
    'tailwindcss',
    'autoprefixer',
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
    'src/app.tsx',
    'src/main.tsx',
    'src/css/tailwind.css',
    'gm.header',
    'tsconfig.json',
    'webpack.config.cjs',
    'postcss.config.cjs',
    'tailwind.config.cjs',
  ], {
    overwrite: false,
  });

  const pkg = packageJson()
        .merge({ type: 'module', })
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
module.exports.description = 'userscript project, using react and webpack build.';
