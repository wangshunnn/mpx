import { View } from 'react-native'
import React, { forwardRef, useState, useRef } from 'react'
import { LinearGradient, LinearGradientProps } from 'react-native-linear-gradient'
import useInnerProps, { getCustomEvent } from './getInnerListeners'
import useNodesRef, { HandlerRef } from './useNodesRef' // 引入辅助函数
import { parseInlineStyle, useTransformStyle, splitStyle, splitProps, useLayout, wrapChildren } from './utils'
/**
 * ✔ value
 * ✔ bindchange
 * ✘ bindpickstart
 * ✘ bindpickend
 * ✘ mask-class
 * ✔ indicator-style: 优先级indicator-style.height > pick-view-column中的子元素设置的height
 * ✘ indicator-class
 * ✘ mask-style
 * ✘ immediate-change
 */

interface PickerViewProps {
  children: React.ReactNode
  // 初始的defaultValue数组中的数字依次表示 picker-view 内的 picker-view-column 选择的第几项（下标从 0 开始），
  // 数字大于 picker-view-column 可选项长度时，选择最后一项。
  value?: Array<number>
  bindchange?: Function
  style: {
    [key: string]: any
  }
  'indicator-style'?: string
  'enable-var': boolean
  'external-var-context'?: Record<string, any>,
  'enable-offset': boolean
}

interface PickerLayout {
  height: number,
  itemHeight: number
}

interface PosType {
  height?: number,
  top?: number
}

const styles: { [key: string]: Object } = {
  wrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    overflow: 'hidden',
    alignItems: 'center'
  }
}

const _PickerView = forwardRef<HandlerRef<View, PickerViewProps>, PickerViewProps>((props: PickerViewProps, ref) => {
  const {
    children,
    value = [],
    bindchange,
    style,
    'enable-var': enableVar,
    'external-var-context': externalVarContext
  } = props
  // indicatorStyle 需要转换为rn的style
  // 微信设置到pick-view上上设置的normalStyle如border等需要转换成RN的style然后进行透传
  const indicatorStyle = parseInlineStyle(props['indicator-style'])
  const { height: indicatorH, width: indicatorW } = indicatorStyle
  const nodeRef = useRef(null)
  const cloneRef = useRef(null)
  const changingCnt = useRef(0)
  const changedValue = useRef(value)
  const [pickH, setPickH] = useState(0)
  const isSetW = indicatorW !== undefined ? 1 : 0
  const itemH = pickH / 5
  const maskPos: PosType = {}
  useNodesRef<View, PickerViewProps>(props, ref, nodeRef, {})
  // picker-view 设置的color等textStyle,在小程序上的表现是可以继承到最内层的text样式,
  // 但是RN内部column是slot无法设置, 需要业务自己在column内的元素上设置
  const {
    normalStyle,
    hasVarDec,
    varContextRef,
    hasSelfPercent,
    setWidth,
    setHeight
  } = useTransformStyle(style, { enableVar, externalVarContext })
  const { textStyle } = splitStyle(normalStyle)
  const { textProps } = splitProps(props)
  const {
    // 存储layout布局信息
    layoutRef,
    layoutProps,
    layoutStyle
  } = useLayout({ props, hasSelfPercent, setWidth, setHeight, nodeRef: nodeRef })

  if (normalStyle?.height && pickH && pickH !== normalStyle.height) {
    maskPos.height = itemH * 2 + Math.ceil((normalStyle.height - pickH) / 2)
  } else {
    maskPos.height = itemH * 2
  }

  const onColumnLayoutChange = (layoutConfig: PickerLayout) => {
    setPickH(layoutConfig.height)
  }

  const hasChanged = () => {
    if (value.length === 1) {
      return true
    }
    return !changingCnt.current
  }

  const onChanging = (columnIndex: number) => {
    changingCnt.current |= 1 << columnIndex
  }

  const onChanged = (columnIndex: number) => {
    changingCnt.current &= ~(1 << columnIndex)
  }

  const onSelectChange = (columnIndex: number, selIndex: number) => {
    onChanged(columnIndex)
    changedValue.current[columnIndex] = selIndex
    if (hasChanged()) {
      const eventData = getCustomEvent(
        'change',
        {},
        { detail: { value: changedValue.current, source: 'change' }, layoutRef }
      )
      bindchange?.(eventData)
    }
  }

  const onInitialSelectChange = (value: number[]) => {
    const eventData = getCustomEvent(
      'change',
      {},
      { detail: { value, source: 'change' }, layoutRef }
    )
    bindchange?.(eventData)
  }

  const innerProps = useInnerProps(
    props,
    {
      ref: nodeRef,
      style: {
        ...normalStyle,
        ...layoutStyle,
        position: 'relative',
        overflow: 'hidden'
      },
      ...layoutProps
    },
    ['enable-offset'],
    { layoutRef }
  )

  const cloneChild = (child: React.ReactElement, index: number, data: React.ReactNode[], initialIndex: number) => {
    const extraProps = {}
    const childProps = child?.props || {}
    const wrappedProps = {
      ...childProps,
      columnData: data,
      ref: cloneRef,
      columnIndex: index,
      key: `pick-view-${index}`,
      wrapperStyle: {
        height: normalStyle?.height || 0,
        itemHeight: indicatorH || 0
      },
      onColumnLayoutChange,
      onSelectChange: onSelectChange.bind(null, index),
      onChanging,
      onChanged,
      initialIndex,
      ...extraProps
    }
    const realElement = React.cloneElement(child, wrappedProps)
    return wrapChildren(
      {
        children: realElement
      },
      {
        hasVarDec,
        varContext: varContextRef.current,
        textStyle,
        textProps
      }
    )
  }

  const renderLine = () => {
    return (
      <View
        style={[
          {
            position: 'absolute',
            top: '50%',
            left: '3%',
            right: '3%',
            transform: [{ translateY: -(itemH / 2) }],
            height: itemH,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: '#f0f0f0',
            backgroundColor: '#ebebeb',
            borderRadius: 10,
            width: '94%',
            zIndex: -1
          }
        ]}
        pointerEvents="none"
      ></View>
    )
  }

  const validateChildInitialIndex = (index: number, data: React.ReactNode[]) => {
    return Math.max(0, Math.min(value[index] || 0, data.length - 1))
  }

  const renderSubChild = () => {
    const columns = React.Children.toArray(children)
    const renderedChildren: React.ReactNode[] = []
    const validValue: number[] = []
    let isInvalid = false
    columns.forEach((item: React.ReactElement, index) => {
      const data = React.Children.toArray(item?.props?.children)
      const validIdx = validateChildInitialIndex(index, data)
      if (validIdx !== value[index]) {
        isInvalid = true
      }
      validValue.push(validIdx)
      renderedChildren.push(cloneChild(item, index, data, validIdx))
    })
    if (isInvalid) {
      changedValue.current = validValue
      onInitialSelectChange(validValue)
    }
    return renderedChildren
  }

  return (
    <View {...innerProps}>
      <View style={[styles.wrapper]}>{renderSubChild()}</View>
      {!isSetW && renderLine()}
    </View>
  )
})

_PickerView.displayName = 'mpx-picker-view'

export default _PickerView
