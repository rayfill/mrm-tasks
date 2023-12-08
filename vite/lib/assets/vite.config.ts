import { UserConfig, defineConfig } from 'vite';
import { resolve } from 'node:path';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

// import banner, { BannerPluginOptions } from 'vite-plugin-banner';
// const bannerPluginOptions: BannerPluginOptions = {
//   content: '/**\n hello world\n */'
// };

const userConfig: UserConfig = {
  build: {
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
      },
      formats: ['es', 'cjs']
    },
  },
  plugins: [
    checker({ typescript: true }),
    dts(),
    //banner(bannerPluginOptions),
  ],
};
export default defineConfig(userConfig);
