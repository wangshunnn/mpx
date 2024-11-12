/**
 * ✘ type
 * ✘ canvas-id
 * ✘ disable-scroll
 * ✔ bindtouchstart
 * ✔ bindtouchmove
 * ✔ bindtouchend
 * ✔ bindtouchcancel
 * ✔ bindlongtap
 * ✔ binderror
 */
import React, { useRef, useState, useCallback, useEffect, forwardRef, JSX, TouchEvent } from 'react'
import { View, Platform, StyleSheet, NativeSyntheticEvent } from 'react-native'
import { WebView } from 'react-native-webview'
import useNodesRef, { HandlerRef } from '../useNodesRef'
import { useLayout, useTransformStyle } from '../utils'
import useInnerProps, { getCustomEvent } from '../getInnerListeners'
import Bus from './Bus'
import {
  useWebviewBinding,
  constructors,
  WEBVIEW_TARGET
} from './utils'
import CanvasRenderingContext2D from './CanvasRenderingContext2D'
import html from './index.html.ts'
import './CanvasGradient'
import { createImage as canvasCreateImage } from './Image'

const stylesheet = StyleSheet.create({
  container: { overflow: 'hidden', flex: 0 },
  webview: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0
  },
  webviewAndroid9: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flex: 0,
    opacity: 0.99
  }
})

interface CanvasProps {
  style?: Record<string, any>;
  originWhitelist?: Array<string>;
  'enable-var'?: boolean
  'parent-font-size'?: number
  'parent-width'?: number
  'parent-height'?: number
  'external-var-context'?: Record<string, any>
  bindtouchstart?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchmove?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchend?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindtouchcancel?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  bindlongtap?: (event: NativeSyntheticEvent<TouchEvent>) => void;
  binderror?: (event: NativeSyntheticEvent<ErrorEvent>) => void;
}

const _Canvas = forwardRef<HandlerRef<CanvasProps & View, CanvasProps>, CanvasProps>((props: CanvasProps = {}, ref): JSX.Element => {
  const { style = {}, originWhitelist = ['*'], 'enable-var': enableVar, 'external-var-context': externalVarContext, 'parent-font-size': parentFontSize, 'parent-width': parentWidth, 'parent-height': parentHeight } = props
  const { width, height } = style
  const [isLoaded, setIsLoaded] = useState(false)
  const nodeRef = useRef(null)

  const canvasRef = useWebviewBinding({
    targetName: 'canvas',
    properties: { width, height },
    methods: ['toDataURL']
  })

  const {
    normalStyle,
    hasSelfPercent,
    setWidth,
    setHeight
  } = useTransformStyle(style, {
    enableVar,
    externalVarContext,
    parentFontSize,
    parentWidth,
    parentHeight
  })

  const { layoutRef, layoutStyle, layoutProps } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef })
  const innerProps = useInnerProps(props, {
    ref: nodeRef,
    style: { ...normalStyle, ...layoutStyle, ...stylesheet.container, ...{ width, height, opacity: isLoaded ? 1 : 0 }, ...style },
    ...layoutProps
  }, [], {
    layoutRef
  })

  const context2D = new CanvasRenderingContext2D(canvasRef.current)

  // 初始化bus和context2D
  useEffect(() => {
    const webviewPostMessage = (message) => {
      if (canvasRef.current.webview) {
        canvasRef.current.webview.postMessage(JSON.stringify(message))
      }
    }

    // 设置bus
    canvasRef.current.bus = new Bus(webviewPostMessage)
    canvasRef.current.bus.pause()

    // 设置 context 2D
    canvasRef.current.context2D = context2D

    // 设置 getContext 方法
    canvasRef.current.getContext = getContext

    // 设置 createImage 方法
    canvasRef.current.createImage = createImage

    // 设置 postMessage 方法
    canvasRef.current.postMessage = postMessage

    // 设置 listeners
    canvasRef.current.listeners = []

    canvasRef.current.addMessageListener = addMessageListener

    canvasRef.current.removeMessageListener = removeMessageListener
  }, [])

  const createImage = (width?: Number, height?: Number) => {
    return canvasCreateImage(canvasRef.current, width, height)
  }
  const getContext = useCallback((contextType: string) => {
    if (contextType === '2d') {
      return context2D
    }
    return null
  }, [])

  const postMessage = useCallback(async (message) => {
    if (!canvasRef.current?.bus) return
    const { type, payload } = await canvasRef.current.bus.post({
      id: Math.random(),
      ...message
    })

    switch (type) {
      case 'error': {
        const { binderror } = props
        binderror &&
          binderror(
            getCustomEvent('error', {}, {
              detail: {
                errMsg: payload.message
              },
              layoutRef
            }, props)
          )
        break
      }
      case 'json': {
        return payload
      }
      case 'blob': {
        return atob(payload)
      }
    }
  }, [])

  const addMessageListener = (listener) => {
    canvasRef.current.listeners.push(listener)
    return () => canvasRef.current.removeMessageListener(listener)
  }

  const removeMessageListener = (listener) => {
    canvasRef.current.listeners.splice(canvasRef.current.listeners.indexOf(listener), 1)
  }

  const onMessage = useCallback((e) => {
    let data = JSON.parse(e.nativeEvent.data)
    switch (data.type) {
      case 'error': {
        const { binderror } = props
        binderror &&
          binderror(
            getCustomEvent('error', e, {
              detail: {
                errMsg: data.payload.message
              },
              layoutRef
            }, props)
          )
        break
      }
      default: {
        if (data.payload) {
          // createLinearGradient 方法调用需要在 constructors 中需要注册 CanvasGradient
          const constructor = constructors[data.meta.constructor]
          if (constructor) {
            const { args, payload } = data
            // RN 端同步生成一个 CanvasGradient 的实例
            const object = constructor.constructLocally(canvasRef.current, ...args)
            Object.assign(object, payload, {
              [WEBVIEW_TARGET]: data.meta.target
            })
            data = {
              ...data,
              payload: object
            }
          }
          for (const listener of canvasRef.current.listeners) {
            listener(data.payload)
          }
        }
        canvasRef.current.bus.handle(data)
      }
    }
  }, [])

  const onLoad = useCallback(() => {
    setIsLoaded(true)
    if (canvasRef.current?.bus) {
      canvasRef.current.bus.resume()
    }
  }, [])

  useNodesRef(props, ref, nodeRef, {
    node: canvasRef.current
  })

  if (Platform.OS === 'android') {
    const isAndroid9 = Platform.Version >= 28
    return (
      <View {...innerProps}>
        <WebView
         ref={(element) => {
           if (canvasRef.current) {
             canvasRef.current.webview = element
           }
         }}
          style={[
            isAndroid9 ? stylesheet.webviewAndroid9 : stylesheet.webview,
            { height, width }
          ]}
          source={{ html }}
          originWhitelist={originWhitelist}
          onMessage={onMessage}
          onLoad={onLoad}
          overScrollMode="never"
          mixedContentMode="always"
          scalesPageToFit={false}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          allowUniversalAccessFromFileURLs
        />
      </View>
    )
  }

  return (
    <View
      {...innerProps}
    >
      <WebView
        ref={(element) => {
          if (canvasRef.current) {
            canvasRef.current.webview = element
          }
        }}
        style={[stylesheet.webview, { height, width }]}
        source={{ html }}
        originWhitelist={originWhitelist}
        onMessage={onMessage}
        onLoad={onLoad}
        scrollEnabled={false}
      />
    </View>
  )
})
_Canvas.displayName = 'mpxCanvas'

export default _Canvas
