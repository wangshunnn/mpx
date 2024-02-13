import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'
import { headerPlugin } from './headerMdPlugin.cjs'
import { nav, sidebar, i18n, algoliaTranslations } from './const'

const ogUrl = 'https://mpxjs.cn/'
const ogImage = `${ogUrl}logo.png`
const title = 'Mpx框架'
const description = '深度性能优化的增强型小程序开发框架'

export default defineConfig({
  // TODO 临时 base
  base: '/mpx',
  title: title,
  description: 'Mpx.js - 深度性能优化的增强型小程序开发框架',
  lang: 'zh-CN',
  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
  },
  head: [
    [
      'link',
      { rel: 'icon', href: 'https://mpxjs.cn/favicon.ico', type: 'image/png', sizes: '16x16' },
    ],
    ['meta', { name: 'author', content: title }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: title }],
    ['meta', { name: 'og:description', content: description }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
  ],
  lastUpdated: false,
  cleanUrls: true,
  vite: {
    plugins: [UnoCSS()],
  },
  markdown: {
    // theme: { light: 'github-light', dark: 'github-dark' },
    config(md) {
      md.use(headerPlugin)
    },
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
        apiKey: '7849f511f78afc4383a81f0137a91c0f',
        placeholder: '搜索文档',
        translations: algoliaTranslations,
      },
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
      },
    },
    outline: 'deep',
    socialLinks: [{ icon: 'github', link: 'https://github.com/didi/mpx' }],
    // i18n
    sidebarMenuLabel: i18n.menu,
    outlineTitle: i18n.toc,
    returnToTopLabel: i18n.returnToTop,
    darkModeSwitchLabel: i18n.appearance,
    docFooter: {
      prev: i18n.previous,
      next: i18n.next,
    },
  },
})
