import { h } from 'vue'
import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MpxLayout from '@theme/components/MpxLayout.vue'

import './styles/overrides.css'
import 'uno.css'

export default {
  ...DefaultTheme,
  Layout: () => {
    return h(MpxLayout)
  },
  // enhanceApp({ app }) {
  //   app.component('BlogHome', BlogHome)
  //   // if (inBrowser) {
  //   //   router.onAfterRouteChanged = () => {
  //   //   }
  //   // }
  // }
} satisfies Theme
