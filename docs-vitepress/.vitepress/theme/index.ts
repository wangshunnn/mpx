// import { h } from 'vue'
import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import './styles/overrides.css'
import 'uno.css'

export default {
  ...DefaultTheme,
  Layout: () => {
    // return h(CustomLayout)
  },
  // enhanceApp({ app }) {
  //   app.component('BlogHome', BlogHome)
  //   // if (inBrowser) {
  //   //   router.onAfterRouteChanged = () => {
  //   //   }
  //   // }
  // }
} satisfies Theme
