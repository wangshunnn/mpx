import { useEffect, useLayoutEffect, useSyncExternalStore, useRef, useMemo, createElement, memo, forwardRef, useImperativeHandle, useContext, Fragment, cloneElement, createContext } from 'react'
import * as ReactNative from 'react-native'
import { ReactiveEffect } from '../../observer/effect'
import { watch } from '../../observer/watch'
import { del, reactive, set } from '../../observer/reactive'
import { hasOwn, isFunction, noop, isObject, isArray, getByPath, collectDataset, hump2dash, dash2hump, callWithErrorHandling, wrapMethodsWithErrorHandling, error } from '@mpxjs/utils'
import MpxProxy from '../../core/proxy'
import { BEFOREUPDATE, ONLOAD, UPDATED, ONSHOW, ONHIDE, ONRESIZE, REACTHOOKSEXEC } from '../../core/innerLifecycle'
import mergeOptions from '../../core/mergeOptions'
import { queueJob, hasPendingJob } from '../../observer/scheduler'
import { createSelectorQuery, createIntersectionObserver } from '@mpxjs/api-proxy'
import MpxKeyboardAvoidingView from '@mpxjs/webpack-plugin/lib/runtime/components/react/dist/mpx-keyboard-avoiding-view'
import {
  IntersectionObserverContext,
  KeyboardAvoidContext,
  RouteContext
} from '@mpxjs/webpack-plugin/lib/runtime/components/react/dist/context'
import { PortalHost, useSafeAreaInsets, GestureHandlerRootView, useHeaderHeight } from '../env/navigationHelper'

const ProviderContext = createContext(null)
function getSystemInfo () {
  const windowDimensions = ReactNative.Dimensions.get('window')
  const screenDimensions = ReactNative.Dimensions.get('screen')
  return {
    deviceOrientation: windowDimensions.width > windowDimensions.height ? 'landscape' : 'portrait',
    size: {
      screenWidth: screenDimensions.width,
      screenHeight: screenDimensions.height,
      windowWidth: windowDimensions.width,
      windowHeight: windowDimensions.height
    }
  }
}

function createEffect (proxy, components) {
  const update = proxy.update = () => {
    // react update props in child render(async), do not need exec pre render
    // if (proxy.propsUpdatedFlag) {
    //   proxy.updatePreRender()
    // }
    if (proxy.isMounted()) {
      proxy.callHook(BEFOREUPDATE)
      proxy.pendingUpdatedFlag = true
    }
    proxy.stateVersion = Symbol()
    proxy.onStoreChange && proxy.onStoreChange()
  }
  update.id = proxy.uid
  const getComponent = (tagName) => {
    if (!tagName) return null
    if (tagName === 'block') return Fragment
    const appComponents = global.__getAppComponents?.() || {}
    const generichash = proxy.target.generichash || ''
    const genericComponents = global.__mpxGenericsMap?.[generichash] || noop
    return components[tagName] || genericComponents(tagName) || appComponents[tagName] || getByPath(ReactNative, tagName)
  }
  const innerCreateElement = (type, ...rest) => {
    if (!type) return null
    return createElement(type, ...rest)
  }

  proxy.effect = new ReactiveEffect(() => {
    // reset instance
    proxy.target.__resetInstance()
    return callWithErrorHandling(proxy.target.__injectedRender.bind(proxy.target), proxy, 'render function', [innerCreateElement, getComponent])
  }, () => queueJob(update), proxy.scope)
  // render effect允许自触发
  proxy.toggleRecurse(true)
}

function getRootProps (props, validProps) {
  const rootProps = {}
  for (const key in props) {
    const altKey = dash2hump(key)
    if (!hasOwn(validProps, key) && !hasOwn(validProps, altKey) && key !== 'children') {
      rootProps[key] = props[key]
    }
  }
  return rootProps
}

const instanceProto = {
  setData (data, callback) {
    return this.__mpxProxy.forceUpdate(data, { sync: true }, callback)
  },
  triggerEvent (eventName, eventDetail) {
    const props = this.__props
    const handler = props && (props['bind' + eventName] || props['catch' + eventName] || props['capture-bind' + eventName] || props['capture-catch' + eventName])
    if (handler && typeof handler === 'function') {
      const timeStamp = +new Date()
      const dataset = collectDataset(props)
      const id = props.id || ''
      const eventObj = {
        type: eventName,
        timeStamp,
        target: {
          id,
          dataset,
          targetDataset: dataset
        },
        currentTarget: {
          id,
          dataset
        },
        detail: eventDetail
      }
      handler.call(this, eventObj)
    }
  },
  getPageId () {
    return this.__pageId
  },
  selectComponent (selector) {
    return this.__selectRef(selector, 'component')
  },
  selectAllComponents (selector) {
    return this.__selectRef(selector, 'component', true)
  },
  createSelectorQuery () {
    return createSelectorQuery().in(this)
  },
  createIntersectionObserver (opt) {
    return createIntersectionObserver(this, opt, this.__intersectionCtx)
  },
  __resetInstance () {
    this.__dispatchedSlotSet = new WeakSet()
  },
  __iter (val, fn) {
    let i, l, keys, key
    const result = []
    if (isArray(val) || typeof val === 'string') {
      for (i = 0, l = val.length; i < l; i++) {
        result.push(fn.call(this, val[i], i))
      }
    } else if (typeof val === 'number') {
      for (i = 0; i < val; i++) {
        result.push(fn.call(this, i + 1, i))
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        result.push(fn.call(this, val[key], key, i))
      }
    }
    return result
  },
  __getProps () {
    const props = this.__props
    const validProps = this.__validProps
    const propsData = {}
    Object.keys(validProps).forEach((key) => {
      if (hasOwn(props, key)) {
        propsData[key] = props[key]
      } else {
        const altKey = hump2dash(key)
        if (hasOwn(props, altKey)) {
          propsData[key] = props[altKey]
        } else {
          let field = validProps[key]
          if (isFunction(field) || field === null) {
            field = {
              type: field
            }
          }
          // 处理props默认值
          propsData[key] = field.value
        }
      }
    })
    return propsData
  },
  __getSlot (name, slot) {
    const { children } = this.__props
    if (children) {
      let result = []
      if (isArray(children) && !hasOwn(children, '__slot')) {
        children.forEach(child => {
          if (hasOwn(child, '__slot')) {
            if (child.__slot === name) result.push(...child)
          } else if (child?.props?.slot === name) {
            result.push(child)
          }
        })
      } else {
        if (hasOwn(children, '__slot')) {
          if (children.__slot === name) result.push(...children)
        } else if (children?.props?.slot === name) {
          result.push(children)
        }
      }
      result = result.filter(item => {
        if (!isObject(item) || this.__dispatchedSlotSet.has(item)) return false
        this.__dispatchedSlotSet.add(item)
        return true
      })
      if (!result.length) return null
      result.__slot = slot
      return result
    }
    return null
  }
}

function createInstance ({ propsRef, type, rawOptions, currentInject, validProps, components, pageId, intersectionCtx, relation, parentProvides }) {
  const instance = Object.create(instanceProto, {
    dataset: {
      get () {
        const props = propsRef.current
        return collectDataset(props)
      },
      enumerable: true
    },
    id: {
      get () {
        const props = propsRef.current
        return props.id
      },
      enumerable: true
    },
    __props: {
      get () {
        return propsRef.current
      },
      enumerable: false
    },
    __pageId: {
      get () {
        return pageId
      },
      enumerable: false
    },
    __intersectionCtx: {
      get () {
        return intersectionCtx
      },
      enumerable: false
    },
    __validProps: {
      get () {
        return validProps
      },
      enumerable: false
    },
    __injectedRender: {
      get () {
        return currentInject.render || noop
      },
      enumerable: false
    },
    __getRefsData: {
      get () {
        return currentInject.getRefsData || noop
      },
      enumerable: false
    },
    __parentProvides: {
      get () {
        return parentProvides || null
      },
      enumerable: false
    }
  })

  if (type === 'component') {
    Object.defineProperty(instance, '__componentPath', {
      get () {
        return currentInject.componentPath || ''
      },
      enumerable: false
    })
  }

  if (relation) {
    Object.defineProperty(instance, '__relation', {
      get () {
        return relation
      },
      enumerable: false
    })
  }

  // bind this & assign methods
  if (rawOptions.methods) {
    Object.entries(rawOptions.methods).forEach(([key, method]) => {
      instance[key] = method.bind(instance)
    })
  }

  if (type === 'page') {
    const props = propsRef.current
    instance.route = props.route.name
    global.__mpxPagesMap = global.__mpxPagesMap || {}
    global.__mpxPagesMap[props.route.key] = [instance, props.navigation]
    // App onLaunch 在 Page created 之前执行
    if (!global.__mpxAppHotLaunched && global.__mpxAppOnLaunch) {
      global.__mpxAppOnLaunch(props.navigation)
    }
  }

  const proxy = instance.__mpxProxy = new MpxProxy(rawOptions, instance)
  proxy.created()

  if (type === 'page') {
    const props = propsRef.current
    proxy.callHook(ONLOAD, [props.route.params || {}])
  }

  Object.assign(proxy, {
    onStoreChange: null,
    stateVersion: Symbol(),
    subscribe: (onStoreChange) => {
      if (!proxy.effect) {
        createEffect(proxy, components)
        proxy.stateVersion = Symbol()
      }
      proxy.onStoreChange = onStoreChange
      return () => {
        proxy.effect && proxy.effect.stop()
        proxy.effect = null
        proxy.onStoreChange = null
      }
    },
    getSnapshot: () => {
      return proxy.stateVersion
    }
  })
  // react数据响应组件更新管理器
  if (!proxy.effect) {
    createEffect(proxy, components)
  }

  return instance
}

function hasPageHook (mpxProxy, hookNames) {
  const options = mpxProxy.options
  const type = options.__type__
  return hookNames.some(h => {
    if (mpxProxy.hasHook(h)) {
      return true
    }
    if (type === 'page') {
      return isFunction(options.methods && options.methods[h])
    } else if (type === 'component') {
      return options.pageLifetimes && isFunction(options.pageLifetimes[h])
    }
    return false
  })
}

const triggerPageStatusHook = (mpxProxy, event) => {
  mpxProxy.callHook(event === 'show' ? ONSHOW : ONHIDE)
  const pageLifetimes = mpxProxy.options.pageLifetimes
  if (pageLifetimes) {
    const instance = mpxProxy.target
    isFunction(pageLifetimes[event]) && pageLifetimes[event].call(instance)
  }
}

const triggerResizeEvent = (mpxProxy) => {
  const type = mpxProxy.options.__type__
  const systemInfo = getSystemInfo()
  const target = mpxProxy.target
  mpxProxy.callHook(ONRESIZE, [systemInfo])
  if (type === 'page') {
    target.onResize && target.onResize(systemInfo)
  } else {
    const pageLifetimes = mpxProxy.options.pageLifetimes
    pageLifetimes && isFunction(pageLifetimes.resize) && pageLifetimes.resize.call(target, systemInfo)
  }
}

function usePageEffect (mpxProxy, pageId) {
  useEffect(() => {
    let unWatch
    const hasShowHook = hasPageHook(mpxProxy, [ONSHOW, 'show'])
    const hasHideHook = hasPageHook(mpxProxy, [ONHIDE, 'hide'])
    const hasResizeHook = hasPageHook(mpxProxy, [ONRESIZE, 'resize'])
    if (hasShowHook || hasHideHook || hasResizeHook) {
      if (hasOwn(pageStatusMap, pageId)) {
        unWatch = watch(() => pageStatusMap[pageId], (newVal) => {
          if (newVal === 'show' || newVal === 'hide') {
            triggerPageStatusHook(mpxProxy, newVal)
          } else if (/^resize/.test(newVal)) {
            triggerResizeEvent(mpxProxy)
          }
        }, { sync: true })
      }
    }
    return () => {
      unWatch && unWatch()
    }
  }, [])
}

let pageId = 0
const pageStatusMap = global.__mpxPageStatusMap = reactive({})

function usePageStatus (navigation, pageId) {
  navigation.pageId = pageId
  if (!hasOwn(pageStatusMap, pageId)) {
    set(pageStatusMap, pageId, '')
  }
  useEffect(() => {
    const focusSubscription = navigation.addListener('focus', () => {
      pageStatusMap[pageId] = 'show'
    })
    const blurSubscription = navigation.addListener('blur', () => {
      pageStatusMap[pageId] = 'hide'
    })

    return () => {
      focusSubscription()
      blurSubscription()
      del(pageStatusMap, pageId)
    }
  }, [navigation])
}

const RelationsContext = createContext(null)

const checkRelation = (options) => {
  const relations = options.relations || {}
  let hasDescendantRelation = false
  let hasAncestorRelation = false
  Object.keys(relations).forEach((path) => {
    const relation = relations[path]
    const type = relation.type
    if (['child', 'descendant'].includes(type)) {
      hasDescendantRelation = true
    } else if (['parent', 'ancestor'].includes(type)) {
      hasAncestorRelation = true
    }
  })
  return {
    hasDescendantRelation,
    hasAncestorRelation
  }
}

// 临时用来存储安卓底部（iOS没有这个）的高度（虚拟按键等高度）根据第一次进入推算
let bottomVirtualHeight = null
export function PageWrapperHOC (WrappedComponent) {
  return function PageWrapperCom ({ navigation, route, pageConfig = {}, ...props }) {
    const rootRef = useRef(null)
    const keyboardAvoidRef = useRef(null)
    const intersectionObservers = useRef({})
    const currentPageId = useMemo(() => ++pageId, [])
    const routeContextValRef = useRef({
      navigation,
      pageId: currentPageId
    })
    const currentPageConfig = Object.assign({}, global.__mpxPageConfig, pageConfig)
    if (!navigation || !route) {
      // 独立组件使用时要求传递navigation
      error('Using pageWrapper requires passing navigation and route')
      return null
    }
    usePageStatus(navigation, currentPageId)
    useLayoutEffect(() => {
      navigation.setOptions({
        title: currentPageConfig.navigationBarTitleText?.trim() || '',
        headerStyle: {
          backgroundColor: currentPageConfig.navigationBarBackgroundColor || '#000000'
        },
        headerTintColor: currentPageConfig.navigationBarTextStyle || 'white'
      })

      // TODO 此部分内容在native-stack可删除，用setOptions设置
      if (__mpx_mode__ !== 'ios') {
        ReactNative.StatusBar.setBarStyle(currentPageConfig.barStyle || 'dark-content')
        ReactNative.StatusBar.setTranslucent(true) // 控制statusbar是否占位
        ReactNative.StatusBar.setBackgroundColor('transparent')
      }
    }, [])

    const headerHeight = useHeaderHeight()
    const onLayout = () => {
      const screenDimensions = ReactNative.Dimensions.get('screen')
      if (__mpx_mode__ === 'ios') {
        navigation.layout = {
          x: 0,
          y: headerHeight,
          width: screenDimensions.width,
          height: screenDimensions.height - headerHeight
        }
      } else {
        if (bottomVirtualHeight === null) {
          rootRef.current?.measureInWindow((x, y, width, height) => {
            // 沉浸模式的计算方式
            bottomVirtualHeight = screenDimensions.height - height - headerHeight
            // 非沉浸模式（translucent=true）计算方式, 现在默认是全用沉浸模式，所以先不算这个
            // bottomVirtualHeight = windowDimensions.height - height - headerHeight
            navigation.layout = {
              x: 0,
              y: headerHeight,
              width: screenDimensions.width,
              height: height
            }
          })
        } else {
          navigation.layout = {
            x: 0,
            y: headerHeight, // 这个y值
            width: screenDimensions.width,
            // 后续页面的layout是通过第一次路由进入时候推算出来的底部区域来推算出来的
            height: screenDimensions.height - bottomVirtualHeight - headerHeight
          }
        }
      }
    }
    const withKeyboardAvoidingView = (element) => {
      return createElement(KeyboardAvoidContext.Provider,
        {
          value: keyboardAvoidRef
        },
        createElement(MpxKeyboardAvoidingView,
          {
            style: {
              flex: 1
            },
            contentContainerStyle: {
              flex: 1
            }
          },
          element
        )
      )
    }

    navigation.insets = useSafeAreaInsets()

    return createElement(GestureHandlerRootView,
      {
        // https://github.com/software-mansion/react-native-reanimated/issues/6639 因存在此问题，iOS在页面上进行定宽来暂时规避
        style: __mpx_mode__ === 'ios' && currentPageConfig?.navigationStyle !== 'custom'
          ? {
            height: ReactNative.Dimensions.get('screen').height - useHeaderHeight()
          }
          : {
            flex: 1
          }
      },
      withKeyboardAvoidingView(
        createElement(ReactNative.View,
          {
            style: {
              flex: 1,
              backgroundColor: currentPageConfig?.backgroundColor || '#fff'
            },
            ref: rootRef,
            onLayout
          },
          createElement(RouteContext.Provider,
            {
              value: routeContextValRef.current
            },
            createElement(IntersectionObserverContext.Provider,
              {
                value: intersectionObservers.current
              },
              createElement(PortalHost,
                null,
                createElement(WrappedComponent, {
                  ...props,
                  navigation,
                  route,
                  id: currentPageId
                })
              )
            )
          )
        )
      ))
  }
}

export function getDefaultOptions ({ type, rawOptions = {}, currentInject }) {
  rawOptions = mergeOptions(rawOptions, type, false)
  const components = Object.assign({}, rawOptions.components, currentInject.getComponents())
  const validProps = Object.assign({}, rawOptions.props, rawOptions.properties)
  const { hasDescendantRelation, hasAncestorRelation } = checkRelation(rawOptions)
  if (rawOptions.methods) rawOptions.methods = wrapMethodsWithErrorHandling(rawOptions.methods)
  const defaultOptions = memo(forwardRef((props, ref) => {
    const instanceRef = useRef(null)
    const propsRef = useRef(null)
    const intersectionCtx = useContext(IntersectionObserverContext)
    const { pageId } = useContext(RouteContext) || {}
    const parentProvides = useContext(ProviderContext)
    let relation = null
    if (hasDescendantRelation || hasAncestorRelation) {
      relation = useContext(RelationsContext)
    }
    propsRef.current = props
    let isFirst = false
    if (!instanceRef.current) {
      isFirst = true
      instanceRef.current = createInstance({ propsRef, type, rawOptions, currentInject, validProps, components, pageId, intersectionCtx, relation, parentProvides })
    }
    const instance = instanceRef.current
    useImperativeHandle(ref, () => {
      return instance
    })

    const proxy = instance.__mpxProxy

    let hooksResult = proxy.callHook(REACTHOOKSEXEC, [props])
    if (isObject(hooksResult)) {
      hooksResult = wrapMethodsWithErrorHandling(hooksResult, proxy)
      if (isFirst) {
        const onConflict = proxy.createProxyConflictHandler('react hooks result')
        Object.keys(hooksResult).forEach((key) => {
          if (key in proxy.target) {
            onConflict(key)
          }
          proxy.target[key] = hooksResult[key]
        })
      } else {
        Object.assign(proxy.target, hooksResult)
      }
    }

    if (!isFirst) {
      // 处理props更新
      Object.keys(validProps).forEach((key) => {
        if (hasOwn(props, key)) {
          instance[key] = props[key]
        } else {
          const altKey = hump2dash(key)
          if (hasOwn(props, altKey)) {
            instance[key] = props[altKey]
          }
        }
      })
    }

    useEffect(() => {
      if (proxy.pendingUpdatedFlag) {
        proxy.pendingUpdatedFlag = false
        proxy.callHook(UPDATED)
      }
    })

    usePageEffect(proxy, pageId)

    useEffect(() => {
      proxy.mounted()
      return () => {
        proxy.unmounted()
        proxy.target.__resetInstance()
        // 热更新下会销毁旧页面并创建新页面组件，且旧页面组件销毁时机晚于新页面组件创建，此时__mpxPagesMap中存储的为新页面组件，不应该删除
        // 所以需要判断路由表中存储的页面实例是否为当前页面实例
        if (type === 'page') {
          const routeKey = props.route.key
          if (global.__mpxPagesMap[routeKey] && global.__mpxPagesMap[routeKey][0] === instance) {
            delete global.__mpxPagesMap[routeKey]
          }
        }
      }
    }, [])

    useSyncExternalStore(proxy.subscribe, proxy.getSnapshot)

    if ((rawOptions.options?.disableMemo)) {
      proxy.memoVersion = Symbol()
    }

    const finalMemoVersion = useMemo(() => {
      if (!hasPendingJob(proxy.update)) {
        proxy.finalMemoVersion = Symbol()
      }
      return proxy.finalMemoVersion
    }, [proxy.stateVersion, proxy.memoVersion])

    let root = useMemo(() => proxy.effect.run(), [finalMemoVersion])
    if (root && root.props.ishost) {
      // 对于组件未注册的属性继承到host节点上，如事件、样式和其他属性等
      const rootProps = getRootProps(props, validProps)
      rootProps.style = Object.assign({}, root.props.style, rootProps.style)
      // update root props
      root = cloneElement(root, rootProps)
    }

    const provides = proxy.provides
    if (provides) {
      root = createElement(ProviderContext.Provider, { value: provides }, root)
    }

    if (hasDescendantRelation) {
      const relationProvide = useMemo(() => {
        const componentPath = instance.__componentPath
        if (relation) {
          return Object.assign({}, relation, { [componentPath]: instance })
        } else {
          return {
            [componentPath]: instance
          }
        }
      }, [relation])

      return createElement(
        RelationsContext.Provider,
        {
          value: relationProvide
        },
        root
      )
    } else {
      return root
    }
  }))

  if (rawOptions.options?.isCustomText) {
    defaultOptions.isCustomText = true
  }

  if (type === 'page') {
    return (props) =>
      createElement(PageWrapperHOC(defaultOptions), {
        pageConfig: currentInject.pageConfig,
        ...props
      })
  }
  return defaultOptions
}
