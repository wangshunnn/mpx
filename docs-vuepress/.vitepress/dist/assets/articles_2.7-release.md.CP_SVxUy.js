import{_ as a,c as e,o as s,a7 as t}from"./chunks/framework.CwvFaCp2.js";const m=JSON.parse('{"title":"Mpx2.7 版本正式发布，大幅提升编译构建速度","description":"","frontmatter":{},"headers":[],"relativePath":"articles/2.7-release.md","filePath":"articles/2.7-release.md"}'),i={name:"articles/2.7-release.md"},p=t(`<h1 id="mpx2-7-版本正式发布-大幅提升编译构建速度" tabindex="-1">Mpx2.7 版本正式发布，大幅提升编译构建速度 <a class="header-anchor" href="#mpx2-7-版本正式发布-大幅提升编译构建速度" aria-label="Permalink to &quot;Mpx2.7 版本正式发布，大幅提升编译构建速度&quot;">​</a></h1><blockquote><p>作者：<a href="https://github.com/hiyuki" target="_blank" rel="noreferrer">hiyuki</a></p></blockquote><p><a href="https://www.mpxjs.cn/" target="_blank" rel="noreferrer">Mpx</a>是一款开源的增强型跨端小程序框架，它具有良好的开发体验，极致的应用性能和一份源码同构输出所有小程序平台及web环境的跨端能力。近期，我们发布了框架最新的2.7版本，基于<code>webpack5</code>彻底重构了框架的核心编译构建流程，利用持久化缓存大幅提升了编译构建速度，最高提升可达10倍。除此之外，<code>Mpx2.7</code>版本还带来了一系列重要的功能更新，包括分包输出能力增强，完善的单元测试支持和用户Rules应用等，下面会对这些新特性进行逐个展开介绍。</p><h2 id="编译构建提速" tabindex="-1">编译构建提速 <a class="header-anchor" href="#编译构建提速" aria-label="Permalink to &quot;编译构建提速&quot;">​</a></h2><p>随着小程序生态的日渐发展壮大，各类线上小程序业务体量和复杂度的不断升级，小程序的包体积从最开始的2M以内膨胀到20M甚至30M，已经远远不复当初的&quot;<strong>小</strong>&quot;程序之名。随着小程序项目大小的不断增加，采用框架进行小程序开发的开发者们往往都会面临一个问题，即框架的编译耗时过长，Mpx也不例外。</p><p>以团队负责的小程序项目为例，该项目目前的总包体积已经超过25M，包含近30000个JS模块，400多个页面和3000多个组件，在本地进行一次完整构建需要等待15分钟，CI环境下甚至需要近半个小时，远远超出能够忍受的范围，对小程序开发体验和开发效率造成了极大的影响。虽然旧版本中的watch模式能够在很大程度上缓解我们在开发调试过程中面临的编译耗时问题，但我们在日常开发中，仍然有很多场景无法使用watch模式（首次构建/CI环境/需真机预览等），基于内存缓存的watch模式也无法长期运行。对于这个问题，我们在过去也做了很多技术尝试，如支持watch:prod模式，局部编译，多线程编译，DLL预编译等等，但是整体尝试下来这些方案要么收效有限要么适用面不足，都没能探索到一个能从根本上解决问题的方案。</p><p>直到2020年底，<code>webpack5</code>正式发布，基于文件系统持久化缓存能力的出现，让我们看到了该问题的解决之道。由于webpack5相较于webpack4有着非常多的升级改动，而Mpx的编译构建在过去版本中也存在着各种历史遗留问题，我们花了较长的时间吃透webpack5的源码以及重新思考Mpx中存在的不合理设计。经过3个多月的开发，我们彻底重构了Mpx的核心编译构建流程，使其能够<strong>完整安全地</strong>利用webpack5持久化缓存能力进行构建提速，同时也彻底解决了旧版Mpx中存在的历史遗留问题，在去年10月完成了beta版的开发与发布，并在业务中进行了初步的落地尝试。之后又经过2个多月的业务回归测试和框架功能补全，我们在beta版的基础上又迭代修复了近30个patch版本，在业务上完成了充分的回归测试，让我们确信目前的新版本已经达到了能够release的阶段。</p><blockquote><p>为什么不是<code>Vite</code></p><p>聊起编译提速，可能大部分人首先想到的是Vite，诚然Vite是一个极富创造力的技术方案，但是在小程序场景下，却不一定是最合适的方案，这主要源于Vite最核心的设计利用了现代浏览器原生支持的ESM，而目前没有任何一家的小程序环境能够原生支持ESM，这就使得Vite最核心的按需编译能力无法得到发挥，而Vite使用esbuild带来的编译速度提升，在webpack环境中也可以选择esbuild-loader提供的能力来替换babel/terser，而且目前esbuild提供的编译能力成熟度还远不能和babel/terser相比，再加上Mpx的编译构建流程很大程度上依赖了webpack提供的能力，从成本和收益上考虑采用webpack5对于我们来说无疑是更好的方案。</p></blockquote><p>以团队负责的小程序项目为例，我们来看一下Mpx2.7版本带来的编译提速效果：相较于旧版长达15分钟的构建耗时，在无缓存环境下，新版的构建耗时约为8分钟，速度提升了近1倍；而在有缓存环境下，新版构建耗时可以缩短至80s，速度提升了<strong>10倍以上</strong>！随着我们对CI流程的持久化缓存改造完成，可以确保在日常的大部分构建场景都会在有缓存的环境下进行。</p><h2 id="分包输出能力增强" tabindex="-1">分包输出能力增强 <a class="header-anchor" href="#分包输出能力增强" aria-label="Permalink to &quot;分包输出能力增强&quot;">​</a></h2><p>在Mpx2.7版本中，我们对小程序分包能力的支持进行了进一步的完善增强。</p><h3 id="独立分包初始化模块" tabindex="-1">独立分包初始化模块 <a class="header-anchor" href="#独立分包初始化模块" aria-label="Permalink to &quot;独立分包初始化模块&quot;">​</a></h3><p>在过去的版本中，我们对独立分包进行过专门的构建支持，以满足独立分包资源独占的要求。不过在使用独立分包进行业务开发时，往往会面临的一个棘手问题在于初始化逻辑无处安放。这是由于独立分包没有app.js，而在小程序中，组件的js逻辑会早于页面js执行，具体的执行顺序又和组件的嵌套关系有关，因此我们无法找到一个确定的代码位置来存放独立分包的初始化逻辑。</p><p>在Mpx2.7版本中，我们针对独立分包新增了一个全新的增强特性，让用户能够声明独立分包的初始化模块，该模块将会在独立分包启动时全局最先执行，其实现思路大致如下：在构建时为独立分包中所有的组件和页面都添加模块引用，指向用户声明的初始化模块，这样在独立分包启动时，不管哪个组件/页面的js最先执行，都能保障这个初始化模块最先执行，同时由于模块缓存的存在，后续的组件/页面执行时，该模块也不会被重复执行。</p><p>该特性的详细使用方式可以参考我们的<a href="https://www.mpxjs.cn/guide/advance/subpackage.html#%E7%8B%AC%E7%AB%8B%E5%88%86%E5%8C%85" target="_blank" rel="noreferrer">文档说明</a></p><h3 id="分包异步化" tabindex="-1">分包异步化 <a class="header-anchor" href="#分包异步化" aria-label="Permalink to &quot;分包异步化&quot;">​</a></h3><p><a href="https://developers.weixin.qq.com/miniprogram/dev/framework/subpackages/async.html" target="_blank" rel="noreferrer">分包异步化</a>是微信小程序在去年下半年提出的全新技术特性，该特性打破了传统分包只能引用自身和主包资源的规则限制，通过相关配置和声明，允许分包异步地引用其他分包内的资源，对于复杂小程序的包体积和加载性能优化具有极其重要的意义。</p><p>在过去，受限于小程序分包资源引用规则，Mpx在编译构建时对于跨分包共用的资源有两种处理策略，其一是将其输出到主包当中，让多个分包都能够通过主包访问，这种策略下可以达到总包体积最优，但是往往会对主包体积造成过大的压力。当主包超出2m限制时，我们就需要采用第二种策略，将这部分跨分包共用的资源冗余地输出到各自的分包中，消除其对于主包体积的占用。在实际的Mpx编译构建当中，这两种策略是同时存在的，具体什么时候采用哪种策略是根据资源类型和用户配置来决定的。</p><p>由于分包异步化技术打破了传统分包资源引用规则的限制，理想情况下我们可以做到主包不超限的同时总包无冗余，不过该技术目前也存在一些不足：一是跨平台支持度不佳，只有微信支持，不过据我们了解支付宝目前也在跟进中；二是对交互和体验会带来一些影响，同时存在业务改造成本，但这依然不妨碍该技术成为大型小程序优化包体积和加载性能的最优路径。</p><p><img src="https://dpubstatic.udache.com/static/dpubimg/c7ac0180-6914-46c6-aaed-c1d3cface8e1.jpeg" alt="分包异步化资源引用"></p><p>我们在Mpx2.7版本中对分包异步化中最常用的<code>跨分包自定义组件引用</code>进行了完整支持，与原生小程序不同，Mpx中资源的分包归属不由源码位置决定，而是由资源引用关系决定，因此在跨分包资源引用的场景下，用户需要声明引用的资源属于哪个分包，简单使用示例如下：</p><div class="language-json5 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json5</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;usingComponents&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 通过root query声明组件所属的分包，与packages语法下使用root query声明package所属分包的语义保持一致</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;button&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;../subPackageA/components/button?root=subPackageA&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;list&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;../subPackageB/components/full-list?root=subPackageB&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;simple-list&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;../components/simple-list&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;componentPlaceholder&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;button&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;view&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;list&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;simple-list&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>详细使用方式可参考<a href="https://www.mpxjs.cn/guide/advance/async-subpackage.html#%E5%88%86%E5%8C%85%E5%BC%82%E6%AD%A5%E5%8C%96" target="_blank" rel="noreferrer">文档说明</a></p><p>对于另一项<code>跨分包JS代码引用</code>能力的使用支持，我们目前也正在探索规划中，预计能在今年Q1内完成开发支持。</p><h2 id="单元测试支持" tabindex="-1">单元测试支持 <a class="header-anchor" href="#单元测试支持" aria-label="Permalink to &quot;单元测试支持&quot;">​</a></h2><p>Mpx自从20年开始就对单元测试有了初步的支持，但过去的单测方案在设计上存在一些缺陷，可用性不高，业务落地困难，在Mpx2.7版本中，我们设计了一套全新的技术方案，克服了原有方案中存在的所有问题，在可用性上得到了质的飞跃，新旧方案的对比如下：</p><p>旧方案：通过Mpx编译构建预先将完整的项目源码构建输出为原生小程序格式，再通过jest + miniprogram-simulate加载构建产出的原生小程序组件来执行测试case。该方案的优点在于编译流程统一，方案实现成本较低，缺点在于执行任何case都需要执行完整的构建流程，耗时较长；而且由于构建本身不基于jest进行，也无法使用jest提供的模块mock功能。</p><p><img src="https://dpubstatic.udache.com/static/dpubimg/31756195-2734-4300-8ab4-8b1b7a7d8c8f.jpeg" alt="旧版单测方案"></p><p>新方案：我们fork了miniprogram-simulate仓库对其扩展了load mpx组件的能力，在资源加载的transform过程中通过mpx-jest插件将mpx组件编译为原生小程序组件，再将内容传递给miniprogram-simulate执行渲染并运行测试case。该方案中模块加载完全基于jest并能够实现组件的按需编译，完美规避旧方案中存在的问题，缺点在于编译流程基于jest api重构，与mpx基于webpack的编译流程独立，存在额外的维护成本，后续我们会将通用的编译逻辑抽离维护，在webpack和jest两侧复用。</p><p><img src="https://dpubstatic.udache.com/static/dpubimg/5486308b-b844-402e-802f-f9cc08a07259.jpeg" alt="新版单测方案"></p><p>关于单元测试更详细的使用指南可参考<a href="https://www.mpxjs.cn/guide/tool/unit-test.html" target="_blank" rel="noreferrer">文档说明</a></p><p>随着单测方案的完善，我们今年也会推动单元测试在小程序业务中全面落地，更好地保障代码质量与业务稳定。</p><h2 id="module-rules复用" tabindex="-1">Module.rules复用 <a class="header-anchor" href="#module-rules复用" aria-label="Permalink to &quot;Module.rules复用&quot;">​</a></h2><p>Mpx的单文件支持很大程度上参考了<code>vue-loader</code>的设计，在vue-loader@15版本前，对于单文件组件中各个区块(block)的loaders应用逻辑默认内置在loader当中，如需对某些区块进行自定义配置，需要向loader的options中传递额外的loader应用规则，无法复用webpack配置的<code>module.rules</code>中已经定义好的规则，这往往会导致我们需要在loader options和module.rules中维护重复的loader规则，同样的问题也存在于旧版的<code>mpx-loader</code>中。</p><p>在vue-loader@15版本发布之后，其通过克隆用户原始的rules的方式实现了module.rules的复用，用户不再需要往loader options中传递冗余的loaders规则，本次全新Mpx2.7版本也支持了该特性，我们使用了webpack提供的<code>matchResource</code>能力实现了module.rules的复用，该方案相较于clone rules的方式实现起来更加简洁优雅。</p><p>以上就是Mpx2.7版本的核心更新内容，目前使用脚手架工具创建的项目默认都会使用2.7版本，过往项目如需迁移升级可以查看<a href="https://www.mpxjs.cn/guide/migrate/2.7.html" target="_blank" rel="noreferrer">这篇指南</a>。</p><h2 id="即将到来的新特性" tabindex="-1">即将到来的新特性 <a class="header-anchor" href="#即将到来的新特性" aria-label="Permalink to &quot;即将到来的新特性&quot;">​</a></h2><p>以上就是我们本次Mpx2.7版本带来的全部特性，后续我们也有计划撰写一系列文章对其中的技术细节进行更加深入的分析与介绍，除了上面介绍到的特性外，我们还有一系列特性处于即将发布的状态：</p><ul><li><a href="https://github.com/didi/mpx/pull/919" target="_blank" rel="noreferrer">组件维度运行时渲染方案</a></li><li><a href="https://github.com/didi/mpx/pull/924" target="_blank" rel="noreferrer">页面局部构建能力</a></li><li>E2E自动化测试能力</li><li>基于Vite构建输出web应用</li><li>跨端输出快手小程序</li><li>@mpxjs/fetch提供接口mock能力</li></ul><h2 id="未来规划" tabindex="-1">未来规划 <a class="header-anchor" href="#未来规划" aria-label="Permalink to &quot;未来规划&quot;">​</a></h2><p>未来，我们的工作重心将重新回到运行时，重点致力于<code>composition api</code>编码规范支持和数据响应系统的升级，在保障性能和包体积方面优势的同时，带给开发者用户与时俱进的开发体验。</p><p>在跨端方面，我们与<a href="https://github.com/didi/Hummer" target="_blank" rel="noreferrer">移动端跨端框架Hummer</a>进行了合作，初步探索了Mpx基于Hummer输出为移动端原生应用的可行性，目前整体流程已经基本跑通，待后续能力逐步完善和业务充分落地后，就会在开源版本中发布。</p><p>与此同时，<code>Mpx-cube-ui</code>小程序跨端组件库也在持续地开发完善中，目前业务落地效果良好，预计会在今年下半年正式开源。</p>`,43),l=[p];function r(o,n,h,c,d,k){return s(),e("div",null,l)}const b=a(i,[["render",r]]);export{m as __pageData,b as default};
