import type { DefaultTheme } from 'vitepress'
export const nav: DefaultTheme.NavItem[] = [
  {
    text: '指南',
    activeMatch: '/guide/',
    items: [
      { text: '基础', link: '/guide/basic/start' },
      { text: '进阶', link: '/guide/advance/store' },
      { text: '组合式 API', link: '/guide/composition-api/composition-api' },
      { text: '工具', link: '/guide/tool/ts' },
      { text: '拓展', link: '/guide/extend/index' },
      { text: '理解', link: '/guide/understand/runtime' },
      { text: '迁移', link: '/guide/migrate/2.9' },
    ],
  },
  { text: 'API', activeMatch: '/api/', link: '/api/index' },
  { text: '文章', activeMatch: '/articles/', link: '/articles/index' },
  {
    text: '更新记录',
    activeMatch: '/releases/',
    link: 'https:/github.com/didi/mpx/releases',
  },
]

export const sidebar: DefaultTheme.Sidebar = {
  '/guide/': [
    {
      text: '基础',
      collapsed: false,
      items: [
        { text: '快速开始', link: '/guide/basic/start' },
        { text: '介绍', link: '/guide/basic/intro' },
        { text: '单文件开发', link: '/guide/basic/single-file' },
        { text: 'IDE 高亮配置', link: '/guide/basic/ide' },
        { text: '模板语法', link: '/guide/basic/template' },
        { text: 'CSS 处理', link: '/guide/basic/css' },
        { text: '数据响应', link: '/guide/basic/reactive' },
        { text: '类名样式绑定', link: '/guide/basic/class-style-binding' },
        { text: '条件渲染', link: '/guide/basic/conditional-render' },
        { text: '列表渲染', link: '/guide/basic/list-render' },
        { text: '事件处理', link: '/guide/basic/event' },
        { text: '双向绑定', link: '/guide/basic/two-way-binding' },
        { text: '自定义组件', link: '/guide/basic/component' },
        { text: '获取组件实例/节点信息', link: '/guide/basic/refs' },
      ],
    },
    {
      text: '进阶',
      collapsed: false,
      items: [
        { text: '状态管理（store）', link: '/guide/advance/store' },
        { text: '状态管理（pinia）', link: '/guide/advance/pinia' },
        { text: '使用 mixin', link: '/guide/advance/mixin' },
        { text: '使用 npm', link: '/guide/advance/npm' },
        { text: '使用分包', link: '/guide/advance/subpackage' },
        { text: '分包异步化', link: '/guide/advance/async-subpackage' },
        { text: '跨平台', link: '/guide/advance/platform' },
        { text: '国际化i18n', link: '/guide/advance/i18n' },
        { text: '包体积分析', link: '/guide/advance/size-report' },
        { text: '图像资源处理', link: '/guide/advance/image-process' },
        { text: '原生渐进迁移', link: '/guide/advance/progressive' },
        { text: '原生能力兼容', link: '/guide/advance/ability-compatible' },
        { text: '小程序插件', link: '/guide/advance/plugin' },
        { text: '自定义路径', link: '/guide/advance/custom-output-path' },
        { text: '使用原子类', link: '/guide/advance/utility-first-css' },
        { text: 'SSR', link: '/guide/advance/ssr' },
      ],
    },
    {
      text: '组合式 API',
      collapsed: false,
      items: [
        { text: '组合式 API', link: '/guide/composition-api/composition-api' },
        { text: '响应式 API', link: '/guide/composition-api/reactive-api' },
      ],
    },
    {
      text: '工具',
      collapsed: false,
      items: [
        { text: '使用TypeScript开发小程序', link: '/guide/tool/ts' },
        { text: '单元测试', link: '/guide/tool/unit-test' },
        { text: 'E2E自动化测试', link: '/guide/tool/e2e-test' },
      ],
    },
    {
      text: '拓展',
      collapsed: false,
      link: '/guide/extend/index',
      items: [
        { text: '网络请求', link: '/guide/extend/fetch' },
        { text: 'Api 转换', link: '/guide/extend/api-proxy' },
        { text: '数据 Mock', link: '/guide/extend/mock' },
      ],
    },
    {
      text: '理解',
      collapsed: false,
      items: [
        { text: 'Mpx 运行时增强原理', link: '/guide/understand/runtime' },
        { text: 'Mpx 编译构建原理', link: '/guide/understand/compile' },
      ],
    },
    {
      text: '迁移',
      collapsed: false,
      items: [
        { text: '从 2.8 升级至 2.9', link: '/guide/migrate/2.9' },
        { text: '从 2.7 升级至 2.8', link: '/guide/migrate/2.8' },
        { text: '从旧版本迁移至 2.7', link: '/guide/migrate/2.7' },
        { text: 'mpx-cli v2 迁移到 v3', link: '/guide/migrate/mpx-cli-3' },
      ],
    },
  ],
  '/api/': [
    { text: '全局配置', link: '/api/app-config' },
    { text: '全局 API', link: '/api/global-api' },
    { text: '实例 API', link: '/api/instance-api' },
    { text: 'Store API', link: '/api/store-api' },
    { text: '模板指令', link: '/api/directives' },
    { text: '编译构建', link: '/api/compile' },
    { text: '内建组件', link: '/api/builtIn' },
    {
      text: '响应式 API',
      collapsed: false,
      // link: '/api/reactivity-api',
      items: [
        { text: '响应式基础 API', link: '/api/reactivity-api/basic-reactivity' },
        { text: 'Computed 与 Watch', link: '/api/reactivity-api/computed-watch-api' },
        { text: 'Effect 作用域 API', link: '/api/reactivity-api/effect-scope' },
        { text: 'Refs', link: '/api/reactivity-api/refs-api' },

      ],
    },
    { text: '组合式 API', link: '/api/composition-api' },
    { text: '选项式 API', link: '/api/optional-api' },
    { text: '周边拓展', link: '/api/extend' },
  ],
  '/articles/': [
    { text: '滴滴开源小程序框架Mpx', link: '/articles/1.0' },
    { text: 'Mpx发布2.0，完美支持跨平台开发', link: '/articles/2.0' },
    { text: '小程序框架运行时性能大测评', link: '/articles/performance' },
    { text: 'Mpx框架初体验', link: '/articles/mpx1' },
    { text: 'Mpx框架技术揭秘', link: '/articles/mpx2' },
    { text: '基于Mpx的小程序体积优化', link: '/articles/size-control' },
    {
      text: 'Mpx中基于 Typescript Template Literal Types 实现链式key的类型推导',
      link: '/articles/ts-derivation',
    },
    {
      text: 'Mpx2.7 版本正式发布，大幅提升编译构建速度',
      link: '/articles/2.7-release',
    },
    {
      text: 'Mpx2.8 版本正式发布，使用组合式 API 开发小程序',
      link: '/articles/2.8-release',
    },
    {
      text: 'Mpx2.9 版本正式发布，支持原子类、SSR 和包体积优化',
      link: '/articles/2.9-release',
    },
    { text: 'Mpx-cli 插件化改造', link: '/articles/mpx-cli-next' },
    { text: 'Mpx 小程序单元测试能力建设与实践', link: '/articles/unit-test' },
  ],
}

export const i18n = {
  menu: '菜单',
  toc: '本页目录',
  returnToTop: '返回顶部',
  appearance: '外观',
  previous: '前一篇',
  next: '下一篇',
  pageNotFound: '页面未找到',
  deadLink: {
    before: '你打开了一个不存在的链接：',
    after: '。',
  },
  deadLinkReport: {
    before: '不介意的话请提交到',
    link: '这里',
    after: '，我们会跟进修复。',
  },
  footerLicense: {
    before: '',
    after: '',
  },
  ariaAnnouncer: {
    before: '',
    after: '已经加载完毕',
  },
  ariaDarkMode: '切换深色模式',
  ariaSkipToContent: '直接跳到内容',
  ariaToC: '当前页面的目录',
  ariaMainNav: '主导航',
  ariaMobileNav: '移动版导航',
  ariaSidebarNav: '侧边栏导航',
}

export const algoliaTranslations = {
  button: {
    buttonText: '搜索',
  },
  modal: {
    searchBox: {
      resetButtonTitle: '清除查询条件',
      resetButtonAriaLabel: '清除查询条件',
      cancelButtonText: '取消',
      cancelButtonAriaLabel: '取消',
    },
    startScreen: {
      recentSearchesTitle: '搜索历史',
      noRecentSearchesText: '没有搜索历史',
      saveRecentSearchButtonTitle: '保存到搜索历史',
      removeRecentSearchButtonTitle: '从搜索历史中移除',
      favoriteSearchesTitle: '收藏',
      removeFavoriteSearchButtonTitle: '从收藏中移除',
    },
    errorScreen: {
      titleText: '无法获取结果',
      helpText: '你可能需要检查你的网络连接',
    },
    footer: {
      selectText: '选择',
      navigateText: '切换',
      closeText: '关闭',
      searchByText: '搜索供应商',
    },
    noResultsScreen: {
      noResultsText: '无法找到相关结果',
      suggestedQueryText: '你可以尝试查询',
      reportMissingResultsText: '你认为这个查询应该有结果？',
      reportMissingResultsLinkText: '向我们反馈',
    },
  },
}
