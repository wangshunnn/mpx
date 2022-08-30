import path from 'path'
import mpx from '@mpxjs/web-plugin/vite'

export default {
  plugins: [
    mpx({
      env: 'didi'
      // i18n: {
      //   locale: 'zh-CN',
      //   // messages既可以通过对象字面量传入，也可以通过messagesPath指定一个js模块路径，在该模块中定义配置并导出，dateTimeFormats/dateTimeFormatsPath和numberFormats/numberFormatsPath同理
      //   messagesPath: path.resolve('./src/i18n/index.js')
      // }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve('.')
    },
    extensions: ['.mpx', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    target: ['es2015'],
    sourcemap: true,
    minify: false
  }
}
