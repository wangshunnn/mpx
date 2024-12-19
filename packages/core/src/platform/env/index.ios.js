import { createI18n } from '../builtInMixins/i18nMixin'

export function init (Mpx) {
  global.__mpx = Mpx
  global.__mpxAppCbs = global.__mpxAppCbs || {
    show: [],
    hide: [],
    error: [],
    rejection: []
  }
  if (global.i18n) {
    Mpx.i18n = createI18n(global.i18n)
  }
  initGlobalErrorHandling()
}

function initGlobalErrorHandling () {
  if (global.ErrorUtils) {
    const defaultHandler = global.ErrorUtils.getGlobalHandler()
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      if (global.__mpxAppCbs && global.__mpxAppCbs.error && global.__mpxAppCbs.error.length) {
        global.__mpxAppCbs.error.forEach((cb) => {
          cb(error)
        })
      } else if (defaultHandler) {
        defaultHandler(error, isFatal)
      } else {
        console.error(`${error.name}: ${error.message}\n`)
      }
    })
  }

  const rejectionTrackingOptions = {
    allRejections: true,
    onUnhandled (id, error) {
      if (global.__mpxAppCbs && global.__mpxAppCbs.rejection && global.__mpxAppCbs.rejection.length) {
        global.__mpxAppCbs.rejection.forEach((cb) => {
          cb(error, id)
        })
      } else {
        console.warn(`UNHANDLED PROMISE REJECTION (id: ${id}): ${error}\n`)
      }
    }
  }

  if (global?.HermesInternal?.hasPromise?.()) {
    global.HermesInternal?.enablePromiseRejectionTracker?.(rejectionTrackingOptions)
  } else {
    require('promise/setimmediate/rejection-tracking').enable(rejectionTrackingOptions)
  }
}