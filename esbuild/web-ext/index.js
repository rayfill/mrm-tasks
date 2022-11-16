const { install, copyFiles, makeDirs, packageJson, lines, template } = require('mrm-core');
const { join } = require('path');

function task({
  description, name, homepage_url, page_title,
}) {

  const depends = [
    'tslog@3.3.4',
    'webextension-polyfill',
  ];
  const devDepends = [
    '@types/node',
    '@types/webextension-polyfill',
    'esbuild',
    'esbuild-copy-static-files',
    'ts-node',
    'typescript',
    'web-ext',
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
    'src/background/index.ts',
    'src/content/index.ts',
    'static/icon16.png',
    'static/icon32.png',
    'static/icon64.png',
    'static/icon128.png',
    'static/popup.html',
  ]);

  //    'static/manifest.json',
  const file = template('static/manifest.json', join(__dirname, 'assets/static/manifest.json'));
  file.exists();
  file.get();
  const config = {
    description,
    name,
    homepage_url,
    page_title,
  };
  file.apply(config).save();

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
module.exports.description = 'webextension project, using esbuild';
module.exports.parameters = {
  description: {
    type: 'input',
    message: 'extension description',
    default: 'my extension',
  },
  name: {
    type: 'input',
    message: 'extension name',
    default: 'extension',
  },
  homepage_url: {
    type: 'input',
    message: 'homepage url',
    default: 'http://your-extension.example.com/',
  },
  page_title: {
    type: 'input',
    message: 'popup page title',
    default: 'popup',
  },
};
