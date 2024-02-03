import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'
import { headerPlugin } from './headerMdPlugin.cjs'

const ogUrl = 'https://mpxjs.cn/'
const ogImage = `${ogUrl}logo.png`
const title = 'Mpx框架'
const description = '深度性能优化的增强型小程序开发框架'

const nav = [
  { text: '指南', link: '/guide/basic/start' },
  {
    text: 'Dropdown Menu',
    items: [
      {
        // 该部分的标题
        text: 'Section A Title',
        items: [
          { text: 'Section A Item A', link: '...' },
          { text: 'Section B Item B', link: '...' }
        ]
      }
    ]
  },
  { text: 'API', link: '/api/index' },
  { text: '文章', link: '/articles/index' },
  {
    text: '更新记录',
    link: 'https://github.com/didi/mpx/releases',
  },
]

const sidebar = {
  '/guide/': [
    {
      text: '基础',
      collapsable: false,
      items: [
        { link: 'basic/start' },
        { link: 'basic/intro' },
        { link: 'basic/single-file' },
        { link: 'basic/ide' },
        { link: 'basic/template' },
        { link: 'basic/css' },
        { link: 'basic/reactive' },
        { link: 'basic/class-style-binding' },
        { link: 'basic/conditional-render' },
        { link: 'basic/list-render' },
        { link: 'basic/event' },
        { link: 'basic/two-way-binding' },
        { link: 'basic/component' },
        { link: 'basic/refs' }
      ]
    },
    {
      text: '进阶',
      collapsable: false,
      items: [
        { link: 'advance/store' },
        { link: 'advance/pinia' },
        { link: 'advance/mixin' },
        { link: 'advance/npm' },
        { link: 'advance/subpackage' },
        { link: 'advance/async-subpackage' },
        { link: 'advance/platform' },
        { link: 'advance/i18n' },
        { link: 'advance/size-report' },
        { link: 'advance/image-process' },
        { link: 'advance/progressive' },
        { link: 'advance/ability-compatible' },
        { link: 'advance/plugin' },
        { link: 'advance/custom-output-path' },
        { link: 'advance/utility-first-css' },
        { link: 'advance/ssr' }
      ]
    },
    {
      text: '组合式 API',
      collapsable: false,
      items: [
        { link: 'composition-api/composition-api' },
        { link: 'composition-api/reactive-api' }
      ]
    },
    {
      text: '工具',
      collapsable: false,
      items: [
        { link: 'tool/ts' },
        { link: 'tool/unit-test' },
        { link: 'tool/e2e-test' }
      ]
    },
    {
      text: '拓展',
      collapsable: false,
      link: '/guide/extend',
      items: [
        { link: 'extend/fetch' },
        { link: 'extend/api-proxy' },
        { link: 'extend/mock' }
      ]
    },
    {
      text: '理解',
      collapsable: false,
      items: [{ link: 'understand/runtime' }, { link: 'understand/compile' }]
    },
    {
      text: '迁移',
      collapsable: false,
      items: [
        { link: 'migrate/2.9' },
        { link: 'migrate/2.8' },
        { link: 'migrate/2.7' },
        { link: 'migrate/mpx-cli-3' }
      ]
    }
  ],
  '/api/': [
    { link: 'app-config' },
    { link: 'global-api' },
    { link: 'instance-api' },
    { link: 'store-api' },
    { link: 'directives' },
    { link: 'compile' },
    { link: 'builtIn' },
    { link: 'reactivity-api' },
    { link: 'composition-api' },
    { link: 'optional-api' },
    { link: 'extend' }
  ],
  '/articles/': [
    { text: '滴滴开源小程序框架Mpx', link: '1.0' },
    { text: 'Mpx发布2.0，完美支持跨平台开发', link: '2.0' },
    { text: '小程序框架运行时性能大测评', link: 'performance' },
    { text: 'Mpx框架初体验', link: 'mpx1' },
    { text: 'Mpx框架技术揭秘', link: 'mpx2' },
    { text: '基于Mpx的小程序体积优化', link: 'size-control' },
    {
      text: 'Mpx中基于 Typescript Template Literal Types 实现链式key的类型推导',
      link: 'ts-derivation'
    },
    { text: 'Mpx2.7 版本正式发布，大幅提升编译构建速度', link: '2.7-release' },
    {
      text: 'Mpx2.8 版本正式发布，使用组合式 API 开发小程序',
      link: '2.8-release'
    },
    {
      text: 'Mpx2.9 版本正式发布，支持原子类、SSR 和包体积优化',
      link: '2.9-release'
    },
    { text: 'Mpx-cli 插件化改造', link: 'mpx-cli-next' },
    { text: 'Mpx 小程序单元测试能力建设与实践', link: 'unit-test' }
  ]
}

export default defineConfig({
  title: title,
  description: 'sdsdsd',
  lang: 'zh-CN',
  head: [
    [
      'link',
      { rel: 'icon', href: '/favicon.ico', type: 'image/png', sizes: '16x16' }
    ],
    ['meta', { name: 'author', content: title }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: title }],
    ['meta', { name: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }]

  ],
  lastUpdated: false,
  cleanUrls: true,
  vite: {
    plugins: [UnoCSS()]
  },
  markdown: {
    theme: 'github-dark',
    config (md) {
      md.use(headerPlugin)
    }
  },

  themeConfig: {
    siteTitle: 'Mpx',
    logo: { src: '/favicon.ico' },
    nav,
    sidebar,
    search: {
      provider: 'algolia',
      options: {
        indexName: 'mpxjs',
        appId: 'mpxjs', // ? 待确认
        apiKey: '7849f511f78afc4383a81f0137a91c0f'
      }
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short'
      }
    },
    outline: 'deep',
    socialLinks: [{ icon: 'github', link: 'https://github.com/didi/mpx' }],
    footer: {
      message: '备案号：<a href="https://beian.miit.gov.cn/">蜀ICP备15023364号-2</a>',
      copyright: 'Copyright © 2020-present 滴滴出行'
    }
  }
})
