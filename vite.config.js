/** @type {import('vite').UserConfig} */
export default {
  appType: 'mpa',
  plugins: [],

  css: {
    postcss: null,
  },

  server: {
    fs: {
      strict: true,
    },
  },
}