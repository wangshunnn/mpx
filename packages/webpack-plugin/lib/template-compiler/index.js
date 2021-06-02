const compiler = require('./compiler')
const loaderUtils = require('loader-utils')
const bindThis = require('./bind-this').transform
const InjectDependency = require('../dependency/InjectDependency')
const parseRequest = require('../utils/parse-request')
const getMainCompilation = require('../utils/get-main-compilation')
const matchCondition = require('../utils/match-condition')
const path = require('path')
const isEmptyObject = require('../utils/is-empty-object')
const { transformSlotsToString } = require('../runtime-utils')

module.exports = function (raw) {
  if (/mpx-custom-element\.mpx/.test(this.resourcePath) || /base\.wxml/.test(this.resourcePath)) {
    this.cacheable(false)
  } else {
    this.cacheable()
  }
  const options = loaderUtils.getOptions(this) || {}
  console.log('the template compiler options is:', options)
  const { resourcePath, queryObj } = parseRequest(this.resource)
  const compilation = this._compilation
  const mainCompilation = getMainCompilation(compilation)
  const mpx = mainCompilation.__mpx__
  const mode = mpx.mode
  const env = mpx.env
  const defs = mpx.defs
  const i18n = mpx.i18n
  const externalClasses = mpx.externalClasses
  const decodeHTMLText = mpx.decodeHTMLText
  const globalSrcMode = mpx.srcMode
  const localSrcMode = queryObj.mode
  const packageName = queryObj.packageName || mpx.currentPackageRoot || 'main'
  const componentsMap = mpx.componentsMap[packageName]
  const wxsContentMap = mpx.wxsContentMap
  let scopedId
  if (options.hasScoped) {
    scopedId = options.moduleId
  }

  const warn = (msg) => {
    this.emitWarning(
      new Error('[template compiler][' + this.resource + ']: ' + msg)
    )
  }

  const error = (msg) => {
    this.emitError(
      new Error('[template compiler][' + this.resource + ']: ' + msg)
    )
  }

  const parsed = compiler.parse(raw, {
    warn,
    error,
    componentsAbsolutePath: options.componentsAbsolutePath || {},
    runtimeComponents: options.runtimeComponents || [],
    runtimeCompile: options.runtimeCompile,
    usingComponents: options.usingComponents,
    hasComment: options.hasComment,
    isNative: options.isNative,
    basename: path.basename(resourcePath),
    isComponent: !!componentsMap[resourcePath],
    mode,
    env,
    srcMode: localSrcMode || globalSrcMode,
    defs,
    decodeHTMLText,
    externalClasses,
    scopedId,
    filePath: this.resourcePath,
    i18n,
    checkUsingComponents: mpx.checkUsingComponents,
    globalComponents: Object.keys(mpx.usingComponents),
    // deprecated option
    globalMpxAttrsFilter: mpx.globalMpxAttrsFilter,
    forceProxyEvent: matchCondition(this.resourcePath, mpx.forceProxyEventRules)
  })

  let ast = parsed.root
  let meta = parsed.meta

  if (meta.wxsContentMap) {
    for (let module in meta.wxsContentMap) {
      wxsContentMap[`${resourcePath}~${module}`] = meta.wxsContentMap[module]
    }
  }

  let result = compiler.serialize(ast, meta)

  if (options.isNative || mpx.forceDisableInject) {
    return result
  }

  // 生成的 slots 注入到 runtime
  let injectSlots = {}
  try {
    if (meta.vnodeElements) {
      Object.keys(meta.vnodeElements).forEach(key => {
        injectSlots[key] = {}
        const astChildren = meta.vnodeElements[key]
        astChildren.map(node => {
          const slotTarget = node.slotTarget
          if (slotTarget) {
            if (!injectSlots[key][slotTarget]) {
              injectSlots[key][slotTarget] = []
            }
            const rawRenderFn = compiler.genElement(node, options.usingComponents)
            const code = bindThis(rawRenderFn, {
              needCollect: true,
              ignoreMap: meta.wxsModuleMap
            }).code
            injectSlots[key][slotTarget].push(code.slice(0, -1))
          }
        })
      })
    }
  } catch (e) {
    console.log('generate the vnodeElements error:', e)
  }

  let renderResult = {}
  if (options.runtimeCompile) {
    // 运行时编译组件返回内容，render 函数内部执行会生成 virtual dom tree
    try {
      let _res
      let renderFn = compiler.genElement(ast)
      // console.log('the renderFn is:', renderFn)
      _res = bindThis(renderFn, {
        needCollect: true,
        ignoreMap: meta.wxsModuleMap
      })
      renderResult.code = `global.currentInject = {
        moduleId: ${JSON.stringify(options.moduleId)},
        render: function () {
          var vnode = ${_res.code}
          this._r(vnode[0])
        }
      };\n`
    } catch (e) {
      console.log('the e is:', e)
    }
  } else {
    const rawCode = `global.currentInject = {
      moduleId: ${JSON.stringify(options.moduleId)},
      render: function () {
        ${compiler.genNode(ast)}this._r();
      }
    };\n`
    try {
      renderResult = bindThis(rawCode, {
        needCollect: true,
        ignoreMap: meta.wxsModuleMap
      })
    } catch (e) {
      error(`Invalid render function generated by the template, please check!\n
        Template result:
        ${result}\n
        Error code:
        ${rawCode}
        Error Detail:
        ${e.stack}`)
      return result
    }
  }

  // todo 此处在loader中往其他模块addDep更加危险，考虑修改为通过抽取后的空模块的module.exports来传递信息
  let globalInjectCode = renderResult.code + '\n'

  if (options.runtimeCompile) {
    globalInjectCode += `global.currentInject.runtimeCompile = true;\n`
  }

  if (!isEmptyObject(injectSlots)) {
    let data = '{'
    Object.keys(injectSlots).map(key => {
      data += `'${key}': ${ transformSlotsToString(injectSlots[key]) },`
    })
    data += '}'
    console.log('the data is:', data)
    globalInjectCode += `global.currentInject.injectRuntimeSlots = function () {
      return ${data}
    };\n`
  }

  if (mode === 'tt' && renderResult.propKeys) {
    globalInjectCode += `global.currentInject.propKeys = ${JSON.stringify(renderResult.propKeys)};\n`
  }

  if (meta.computed) {
    globalInjectCode += bindThis(`global.currentInject.injectComputed = {
  ${meta.computed.join(',')}
  };`).code + '\n'
  }

  if (meta.refs) {
    globalInjectCode += `global.currentInject.getRefsData = function () {
  return ${JSON.stringify(meta.refs)};
  };\n`
  }

  const issuer = this._module.issuer
  const parser = issuer.parser
  // console.log('the fileDependencies is:', issuer.buildInfo.fileDependencies, resourcePath)
  // 同步issuer的dependencies，确保watch中issuer rebuild时template也进行rebuild，使该loader中往issuer中注入的依赖持续有效
  issuer.buildInfo.fileDependencies.forEach((dep) => {
    this.addDependency(dep)
  })
  issuer.buildInfo.contextDependencies.forEach((dep) => {
    this.addContextDependency(dep)
  })

  // 删除issuer中上次注入的dependencies，避免issuer本身不需要更新时上次的注入代码残留
  issuer.dependencies = issuer.dependencies.filter((dep) => {
    return !dep.templateInject
  })

  const dep = new InjectDependency({
    content: globalInjectCode,
    index: -2
  })

  dep.templateInject = true
  issuer.addDependency(dep)

  let isSync = true

  const iterationOfArrayCallback = (arr, fn) => {
    for (let index = 0; index < arr.length; index++) {
      fn(arr[index])
    }
  }

  const dependencies = new Map()

  const addDependency = dep => {
    const resourceIdent = dep.getResourceIdentifier()
    if (resourceIdent) {
      const factory = compilation.dependencyFactories.get(dep.constructor)
      if (factory === undefined) {
        throw new Error(`No module factory available for dependency type: ${dep.constructor.name}`)
      }
      let innerMap = dependencies.get(factory)
      if (innerMap === undefined) {
        dependencies.set(factory, (innerMap = new Map()))
      }
      let list = innerMap.get(resourceIdent)
      if (list === undefined) innerMap.set(resourceIdent, (list = []))
      list.push(dep)
    }
  }

  for (let module in meta.wxsModuleMap) {
    isSync = false
    const src = loaderUtils.urlToRequest(meta.wxsModuleMap[module], options.projectRoot)
    // 编译render函数只在mpx文件中运行，此处issuer的context一定等同于当前loader的context
    const expression = `require(${loaderUtils.stringifyRequest(this, src)})`
    const deps = []
    parser.parse(expression, {
      current: {
        addDependency: dep => {
          dep.userRequest = module
          deps.push(dep)
        }
      },
      module: issuer
    })
    issuer.addVariable(module, expression, deps)
    iterationOfArrayCallback(deps, addDependency)
  }

  if (isSync || options.runtimeCompile) {
    if (options.runtimeCompile) {
      const src = loaderUtils.stringifyRequest(this, require.resolve('./base.wxml'))
      console.log('the template-compiler base.wxml is:', require.resolve('./base.wxml'), this.rootContext, src)
      return `<import src=${src}/> <template is="{{r.nodeType || 'h-element'}}" data="{{ r: r }}"></template>`
    }
    return result
  } else {
    const callback = this.async()

    const sortedDependencies = []
    for (const pair1 of dependencies) {
      for (const pair2 of pair1[1]) {
        sortedDependencies.push({
          factory: pair1[0],
          dependencies: pair2[1]
        })
      }
    }

    compilation.addModuleDependencies(
      issuer,
      sortedDependencies,
      compilation.bail,
      null,
      true,
      () => {
        callback(null, result)
      }
    )
  }
}
