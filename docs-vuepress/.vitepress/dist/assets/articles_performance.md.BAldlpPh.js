import{_ as t,c as d,o as e,a7 as a}from"./chunks/framework.CwvFaCp2.js";const s=JSON.parse('{"title":"小程序框架运行时性能大测评","description":"","frontmatter":{"sidebarDepth":2},"headers":[],"relativePath":"articles/performance.md","filePath":"articles/performance.md"}'),r={name:"articles/performance.md"},o=a('<h1 id="小程序框架运行时性能大测评" tabindex="-1">小程序框架运行时性能大测评 <a class="header-anchor" href="#小程序框架运行时性能大测评" aria-label="Permalink to &quot;小程序框架运行时性能大测评&quot;">​</a></h1><blockquote><p>作者：董宏平(<a href="https://github.com/hiyuki" target="_blank" rel="noreferrer">hiyuki</a>)，滴滴出行小程序负责人，mpx框架负责人及核心作者</p></blockquote><p>随着小程序在商业上的巨大成功，小程序开发在国内前端领域越来越受到重视，为了方便广大开发者更好地进行小程序开发，各类小程序框架也层出不穷，呈现出百花齐放的态势。但是到目前为止，业内一直没有出现一份全面、详细、客观、公正的小程序框架测评报告，为小程序开发者在技术选型时提供参考。于是我便筹划推出一系列文章，对业内流行的小程序框架进行一次全方位的、客观公正的测评，本文是系列文章的第一篇——运行时性能篇。</p><p>在本文中，我们会对下列框架进行运行时性能测试(排名不分先后):</p><ul><li>wepy2(<a href="https://github.com/Tencent/wepy" target="_blank" rel="noreferrer">https://github.com/Tencent/wepy</a>) @2.0.0-alpha.20</li><li>uniapp(<a href="https://github.com/dcloudio/uni-app" target="_blank" rel="noreferrer">https://github.com/dcloudio/uni-app</a>) @2.0.0-26120200226001</li><li>mpx(<a href="https://github.com/didi/mpx" target="_blank" rel="noreferrer">https://github.com/didi/mpx</a>) @2.5.3</li><li>chameleon(<a href="https://github.com/didi/chameleon" target="_blank" rel="noreferrer">https://github.com/didi/chameleon</a>) @1.0.5</li><li>mpvue(<a href="https://github.com/Meituan-Dianping/mpvue" target="_blank" rel="noreferrer">https://github.com/Meituan-Dianping/mpvue</a>) @2.0.6</li><li>kbone(<a href="https://github.com/Tencent/kbone" target="_blank" rel="noreferrer">https://github.com/Tencent/kbone</a>) @0.8.3</li><li>taro next(<a href="https://github.com/NervJS/taro" target="_blank" rel="noreferrer">https://github.com/NervJS/taro</a>) @3.0.0-alpha.5</li></ul><p>其中对于kbone和taro next均以vue作为业务框架进行测试。</p><p>运行时性能的测试内容包括以下几个维度：</p><ul><li>框架运行时体积</li><li>页面渲染耗时</li><li>页面更新耗时</li><li>局部更新耗时</li><li>setData调用次数</li><li>setData发送数据大小</li></ul><p>框架性能测试demo全部存放于<a href="https://github.com/hiyuki/mp-framework-benchmark" target="_blank" rel="noreferrer">https://github.com/hiyuki/mp-framework-benchmark</a> 中，欢迎广大开发者进行验证纠错及补全；</p><h2 id="测试方案" tabindex="-1">测试方案 <a class="header-anchor" href="#测试方案" aria-label="Permalink to &quot;测试方案&quot;">​</a></h2><p>为了使测试结果真实有效，我基于常见的业务场景构建了两种测试场景，分别是动态测试场景和静态测试场景。</p><h3 id="动态测试场景" tabindex="-1">动态测试场景 <a class="header-anchor" href="#动态测试场景" aria-label="Permalink to &quot;动态测试场景&quot;">​</a></h3><p>动态测试中，视图基于数据动态渲染，静态节点较少，视图更新耗时和setData调用情况是该测试场景中的主要测试点。</p><p>动态测试demo模拟了实际业务中常见的长列表+多tab场景，该demo中存在两份优惠券列表数据，一份为可用券数据，另一份为不可用券数据，其中同一时刻视图中只会渲染展示其中一份数据，可以在上方的操作区模拟对列表数据的各种操作及视图展示切换(切tab)。</p><p><img src="https://dpubstatic.udache.com/static/dpubimg/PWsGL0GkuQ/dynamic.jpeg" width="300px"></p><p><em>动态测试demo</em></p><p>在动态测试中，我在外部通过函数代理的方式在初始化之前将App、Page和Component构造器进行代理，通过mixin的方式在Page的onLoad和Component的created钩子中注入setData拦截逻辑，对所有页面和组件的setData调用进行监听，并统计小程序的视图更新耗时及setData调用情况。该测试方式能够做到对框架代码的零侵入，能够跟踪到小程序全量的setData行为并进行独立的耗时计算，具有很强的普适性，代码具体实现可以查看<a href="https://github.com/hiyuki/mp-framework-benchmark/blob/master/utils/proxy.js" target="_blank" rel="noreferrer">https://github.com/hiyuki/mp-framework-benchmark/blob/master/utils/proxy.js</a></p><h3 id="静态测试场景" tabindex="-1">静态测试场景 <a class="header-anchor" href="#静态测试场景" aria-label="Permalink to &quot;静态测试场景&quot;">​</a></h3><p>静态测试模拟业务中静态页面的场景，如运营活动和文章等页面，页面内具备大量的静态节点，而没有数据动态渲染，初始ready耗时是该场景下测试的重心。</p><p>静态测试demo使用了我去年发表的一篇技术文章的html代码进行小程序适配构建，其中包含大量静态节点及文本内容。</p><p><img src="https://dpubstatic.udache.com/static/dpubimg/5TOToHvunN/static.jpeg" width="300px"></p><p><em>静态测试demo</em></p><h2 id="测试流程及数据" tabindex="-1">测试流程及数据 <a class="header-anchor" href="#测试流程及数据" aria-label="Permalink to &quot;测试流程及数据&quot;">​</a></h2><blockquote><p>以下所有耗时类的测试数据均为微信小程序中真机进行5次测试计算平均值得出，单位均为ms。Ios测试环境为手机型号iPhone 11，系统版本13.3.1，微信版本7.0.12，安卓测试环境为手机型号小米9，系统版本Android10，微信版本7.0.12。</p></blockquote><blockquote><p>为了使数据展示不过于混乱复杂，文章中所列的数据以Ios的测试结果为主，安卓测试结论与Ios相符，整体耗时比Ios高3~4倍左右，所有的原始测试数据存放在<a href="https://github.com/hiyuki/mp-framework-benchmark/blob/master/rawData.csv" target="_blank" rel="noreferrer">https://github.com/hiyuki/mp-framework-benchmark/blob/master/rawData.csv</a></p></blockquote><blockquote><p>由于transform-runtime引入的core-js会对框架的运行时体积和运行耗时带来一定影响，且不是所有的框架都会在编译时开启transform-runtime，为了对齐测试环境，下述测试均在transform-runtime关闭时进行。</p></blockquote><h3 id="框架运行时体积" tabindex="-1">框架运行时体积 <a class="header-anchor" href="#框架运行时体积" aria-label="Permalink to &quot;框架运行时体积&quot;">​</a></h3><p>由于不是所有框架都能够使用<code>webpack-bundle-analyzer</code>得到精确的包体积占用，这里我通过将各框架生成的demo项目体积减去native编写的demo项目体积作为框架的运行时体积。</p><table tabindex="0"><thead><tr><th></th><th>demo总体积(KB)</th><th>框架运行时体积(KB)</th></tr></thead><tbody><tr><td>native</td><td>27</td><td>0</td></tr><tr><td>wepy2</td><td>66</td><td>39</td></tr><tr><td>uniapp</td><td>114</td><td>87</td></tr><tr><td>mpx</td><td>78</td><td>51</td></tr><tr><td>chameleon</td><td>136</td><td>109</td></tr><tr><td>mpvue</td><td>103</td><td>76</td></tr><tr><td>kbone</td><td>395</td><td>368</td></tr><tr><td>taro next</td><td>183</td><td>156</td></tr></tbody></table><p>该项测试的结论为：<br> native &gt; wepy2 &gt; mpx &gt; mpvue &gt; uniapp &gt; chameleon &gt; taro next &gt; kbone</p><p>结论分析：</p><ul><li>wepy2和mpx在框架运行时体积上控制得最好；</li><li>taro next和kbone由于动态渲染的特性，在dist中会生成递归渲染模板/组件，所以占用体积较大。</li></ul><h3 id="页面渲染耗时-动态测试" tabindex="-1">页面渲染耗时(动态测试) <a class="header-anchor" href="#页面渲染耗时-动态测试" aria-label="Permalink to &quot;页面渲染耗时(动态测试)&quot;">​</a></h3><p>我们使用<code>刷新页面</code>操作触发页面重新加载，对于大部分框架来说，页面渲染耗时是从触发刷新操作到页面执行onReady的耗时，但是对于像kbone和taro next这样的动态渲染框架，页面执行onReady并不代表视图真正渲染完成，为此，我们设定了一个特殊规则，在页面onReady触发的1000ms内，在没有任何操作的情况下出现setData回调时，以最后触发的setData回调作为页面渲染完成时机来计算真实的页面渲染耗时，测试结果如下：</p><table tabindex="0"><thead><tr><th></th><th>页面渲染耗时</th></tr></thead><tbody><tr><td>native</td><td>60.8</td></tr><tr><td>wepy2</td><td>64</td></tr><tr><td>uniapp</td><td>56.4</td></tr><tr><td>mpx</td><td>52.6</td></tr><tr><td>chameleon</td><td>56.4</td></tr><tr><td>mpvue</td><td>117.8</td></tr><tr><td>kbone</td><td>98.6</td></tr><tr><td>taro next</td><td>89.6</td></tr></tbody></table><blockquote><p>该项测试的耗时并不等同于真实的渲染耗时，由于小程序自身没有提供performance api，真实渲染耗时无法通过js准确测试得出，不过从得出的数据来看该项数据依然具备一定的参考意义。</p></blockquote><p>该项测试的结论为：<br> mpx ≈ chameleon ≈ uniapp ≈ native ≈ wepy2 &gt; taro next ≈ kbone ≈ mpvue</p><p>结论分析：</p><ul><li>由于mpvue全量在页面进行渲染，kbone和taro next采用了动态渲染技术，页面渲染耗时较长，其余框架并无太大区别。</li></ul><h3 id="页面更新耗时-无后台数据" tabindex="-1">页面更新耗时(无后台数据) <a class="header-anchor" href="#页面更新耗时-无后台数据" aria-label="Permalink to &quot;页面更新耗时(无后台数据)&quot;">​</a></h3><p>这里后台数据的定义为data中存在但当前页面渲染中未使用到的数据，在这个demo场景下即为不可用券的数据，当前会在不可用券为0的情况下，对可用券列表进行各种操作，并统计更新耗时。</p><p>更新耗时的计算方式是从数据操作事件触发开始到对应的setData回调完成的耗时</p><blockquote><p>mpvue中使用了当前时间戳(new Date)作为超时依据对setData进行了超时时间为50ms的节流操作，该方式存在严重问题，当vue内单次渲染同步流程执行耗时超过50ms时，后续组件patch触发的setData会突破这个节流限制，以50ms每次的频率对setData进行高频无效调用。在该性能测试demo中，当优惠券数量超过500时，界面就会完全卡死。为了顺利跑完整个测试流程，我对该问题进行了简单修复，使用setTimeout重写了节流部分，确保在vue单次渲染流程同步执行完毕后才会调用setData发送合并数据，之后mpvue的所有性能测试都是基于这个patch版本来进行的，该patch版本存放在<a href="https://github.com/hiyuki/mp-framework-benchmark/blob/master/frameworks/mpvue/runtime/patch/index.js" target="_blank" rel="noreferrer">https://github.com/hiyuki/mp-framework-benchmark/blob/master/frameworks/mpvue/runtime/patch/index.js</a></p></blockquote><blockquote><p>理论上来讲native的性能在进行优化的前提下一定是所有框架的天花板，但是在日常业务开发中我们可能无法对每一次setData都进行优化，以下性能测试中所有的native数据均采用修改数据后全量发送的形式来实现。</p></blockquote><p>第一项测试我们使用<code>新增可用券(100)</code>操作将可用券数量由0逐级递增到1000：</p><table tabindex="0"><thead><tr><th></th><th>100</th><th>200</th><th>300</th><th>400</th><th>500</th><th>600</th><th>700</th><th>800</th><th>900</th><th>1000</th></tr></thead><tbody><tr><td>native</td><td>84.6</td><td>69.8</td><td>71.6</td><td>75</td><td>77.2</td><td>78.8</td><td>82.8</td><td>93.2</td><td>93.4</td><td>105.4</td></tr><tr><td>wepy2</td><td>118.4</td><td>168.6</td><td>204.6</td><td>246.4</td><td>288.6</td><td>347.8</td><td>389.2</td><td>434.2</td><td>496</td><td>539</td></tr><tr><td>uniapp</td><td>121.2</td><td>100</td><td>96</td><td>98.2</td><td>97.8</td><td>99.6</td><td>104</td><td>102.4</td><td>109.4</td><td>107.6</td></tr><tr><td>mpx</td><td>110.4</td><td>87.2</td><td>82.2</td><td>83</td><td>80.6</td><td>79.6</td><td>86.6</td><td>90.6</td><td>89.2</td><td>96.4</td></tr><tr><td>chameleon</td><td>116.8</td><td>115.4</td><td>117</td><td>119.6</td><td>122</td><td>125.2</td><td>133.8</td><td>133.2</td><td>144.8</td><td>145.6</td></tr><tr><td>mpvue</td><td>112.8</td><td>121.2</td><td>140</td><td>169</td><td>198.8</td><td>234.2</td><td>278.8</td><td>318.4</td><td>361.4</td><td>408.2</td></tr><tr><td>kbone</td><td>556.4</td><td>762.4</td><td>991.6</td><td>1220.6</td><td>1468.8</td><td>1689.6</td><td>1933.2</td><td>2150.4</td><td>2389</td><td>2620.6</td></tr><tr><td>taro next</td><td>470</td><td>604.6</td><td>759.6</td><td>902.4</td><td>1056.2</td><td>1228</td><td>1393.4</td><td>1536.2</td><td>1707.8</td><td>1867.2</td></tr></tbody></table><p>然后我们按顺序逐项点击<code>删除可用券(all)</code> &gt; <code>新增可用券(1000)</code> &gt; <code>更新可用券(1)</code> &gt; <code>更新可用券(all)</code> &gt; <code>删除可用券(1)</code>：</p><table tabindex="0"><thead><tr><th></th><th>delete(all)</th><th>add(1000)</th><th>update(1)</th><th>update(all)</th><th>delete(1)</th></tr></thead><tbody><tr><td>native</td><td>32.8</td><td>295.6</td><td>92.2</td><td>92.2</td><td>83</td></tr><tr><td>wepy2</td><td>56.8</td><td>726.4</td><td>49.2</td><td>535</td><td>530.8</td></tr><tr><td>uniapp</td><td>43.6</td><td>584.4</td><td>54.8</td><td>144.8</td><td>131.2</td></tr><tr><td>mpx</td><td>41.8</td><td>489.6</td><td>52.6</td><td>169.4</td><td>165.6</td></tr><tr><td>chameleon</td><td>39</td><td>765.6</td><td>95.6</td><td>237.8</td><td>144.8</td></tr><tr><td>mpvue</td><td>103.6</td><td>669.4</td><td>404.4</td><td>414.8</td><td>433.6</td></tr><tr><td>kbone</td><td>120.2</td><td>4978</td><td>2356.4</td><td>2419.4</td><td>2357</td></tr><tr><td>taro next</td><td>126.6</td><td>3930.6</td><td>1607.8</td><td>1788.6</td><td>2318.2</td></tr></tbody></table><blockquote><p>该项测试中初期我update(all)的逻辑是循环对每个列表项进行更新，形如<code>listData.forEach((item)=&gt;{item.count++})</code>，发现在chameleon框架中执行界面会完全卡死，追踪发现chameleon框架中没有对setData进行异步合并处理，而是在数据变动时直接同步发送，这样在数据量为1000的场景下用该方式进行更新会高频触发1000次setData，导致界面卡死；对此，我在chameleon框架的测试demo中，将update(all)的逻辑调整为深clone产生一份更新后的listData，再将其整体赋值到this.listData当中，以确保该项测试能够正常进行。</p></blockquote><p>该项测试的结论为：<br> native &gt; mpx ≈ uniapp &gt; chameleon &gt; mpvue &gt; wepy2 &gt; taro next &gt; kbone</p><p>结论分析：</p><ul><li>mpx和uniapp在框架内部进行了完善的diff优化，随着数据量的增加，两个框架的新增耗时没有显著上升；</li><li>wepy2会在数据变更时对props数据也进行setData，在该场景下造成了大量的无效性能损耗，导致性能表现不佳；</li><li>kbone和taro next采用了动态渲染方案，每次新增更新时会发送大量描述dom结构的数据，与此同时动态递归渲染的耗时也远大于常规的静态模板渲染，使得这两个框架在所有的更新场景下耗时都远大于其他框架。</li></ul><h3 id="页面更新耗时-有后台数据" tabindex="-1">页面更新耗时(有后台数据) <a class="header-anchor" href="#页面更新耗时-有后台数据" aria-label="Permalink to &quot;页面更新耗时(有后台数据)&quot;">​</a></h3><p>刷新页面后我们使用<code>新增不可用券(1000)</code>创建后台数据，观察该操作是否会触发setData并统计耗时</p><table tabindex="0"><thead><tr><th></th><th>back add(1000)</th></tr></thead><tbody><tr><td>native</td><td>45.2</td></tr><tr><td>wepy2</td><td>174.6</td></tr><tr><td>uniapp</td><td>89.4</td></tr><tr><td>mpx</td><td>0</td></tr><tr><td>chameleon</td><td>142.6</td></tr><tr><td>mpvue</td><td>134</td></tr><tr><td>kbone</td><td>0</td></tr><tr><td>taro next</td><td>0</td></tr></tbody></table><blockquote><p>mpx进行setData优化时inspired by vue，使用了编译时生成的渲染函数跟踪模板数据依赖，在后台数据变更时不会进行setData调用，而kbone和taro next采用了动态渲染技术模拟了web底层环境，在上层完整地运行了vue框架，也达到了同样的效果。</p></blockquote><p>然后我们执行和上面无后台数据时相同的操作进行耗时统计，首先是递增100：</p><table tabindex="0"><thead><tr><th></th><th>100</th><th>200</th><th>300</th><th>400</th><th>500</th><th>600</th><th>700</th><th>800</th><th>900</th><th>1000</th></tr></thead><tbody><tr><td>native</td><td>88</td><td>69.8</td><td>71.2</td><td>80.8</td><td>79.4</td><td>84.4</td><td>89.8</td><td>93.2</td><td>99.6</td><td>108</td></tr><tr><td>wepy2</td><td>121</td><td>173.4</td><td>213.6</td><td>250</td><td>298</td><td>345.6</td><td>383</td><td>434.8</td><td>476.8</td><td>535.6</td></tr><tr><td>uniapp</td><td>135.4</td><td>112.4</td><td>110.6</td><td>106.4</td><td>109.6</td><td>107.2</td><td>114.4</td><td>116</td><td>118.8</td><td>117.4</td></tr><tr><td>mpx</td><td>112.6</td><td>86.2</td><td>84.6</td><td>86.8</td><td>90</td><td>87.2</td><td>91.2</td><td>88.8</td><td>92.4</td><td>93.4</td></tr><tr><td>chameleon</td><td>178.4</td><td>178.2</td><td>186.4</td><td>184.6</td><td>192.6</td><td>203.8</td><td>210</td><td>217.6</td><td>232.6</td><td>236.8</td></tr><tr><td>mpvue</td><td>139</td><td>151</td><td>173.4</td><td>194</td><td>231.4</td><td>258.8</td><td>303.4</td><td>340.4</td><td>384.6</td><td>429.4</td></tr><tr><td>kbone</td><td>559.8</td><td>746.6</td><td>980.6</td><td>1226.8</td><td>1450.6</td><td>1705.4</td><td>1927.2</td><td>2154.8</td><td>2367.8</td><td>2617</td></tr><tr><td>taro next</td><td>482.6</td><td>626.2</td><td>755</td><td>909.6</td><td>1085</td><td>1233.2</td><td>1384</td><td>1568.6</td><td>1740.6</td><td>1883.8</td></tr></tbody></table><p>然后按下表操作顺序逐项点击统计</p><table tabindex="0"><thead><tr><th></th><th>delete(all)</th><th>add(1000)</th><th>update(1)</th><th>update(all)</th><th>delete(1)</th></tr></thead><tbody><tr><td>native</td><td>43.4</td><td>299.8</td><td>89.2</td><td>89</td><td>87.2</td></tr><tr><td>wepy2</td><td>43.2</td><td>762.4</td><td>50</td><td>533</td><td>522.4</td></tr><tr><td>uniapp</td><td>57.8</td><td>589.8</td><td>62.6</td><td>160.6</td><td>154.4</td></tr><tr><td>mpx</td><td>45.8</td><td>490.8</td><td>52.8</td><td>167</td><td>166</td></tr><tr><td>chameleon</td><td>93.8</td><td>837</td><td>184.6</td><td>318</td><td>220.8</td></tr><tr><td>mpvue</td><td>124.8</td><td>696.2</td><td>423.4</td><td>419</td><td>430.6</td></tr><tr><td>kbone</td><td>121.4</td><td>4978.2</td><td>2331.2</td><td>2448.4</td><td>2348</td></tr><tr><td>taro next</td><td>129.8</td><td>3947.2</td><td>1610.4</td><td>1813.8</td><td>2290.2</td></tr></tbody></table><p>该项测试的结论为：<br> native &gt; mpx &gt; uniapp &gt; chameleon &gt; mpvue &gt; wepy2 &gt; taro next &gt; kbone</p><p>结论分析：</p><ul><li>具备模板数据跟踪能力的三个框架mpx，kbone和taro next在有后台数据场景下耗时并没有显著增加；</li><li>wepy2当中的diff精度不足，耗时也没有产生明显变化；</li><li>其余框架由于每次更新都会对后台数据进行deep diff，耗时都产生了一定提升。</li></ul><h3 id="页面更新耗时-大数据量场景" tabindex="-1">页面更新耗时(大数据量场景) <a class="header-anchor" href="#页面更新耗时-大数据量场景" aria-label="Permalink to &quot;页面更新耗时(大数据量场景)&quot;">​</a></h3><blockquote><p>由于mpvue和taro next的渲染全部在页面中进行，而kbone的渲染方案会额外新增大量的自定义组件，这三个框架都会在优惠券数量达到2000时崩溃白屏，我们排除了这三个框架对其余框架进行大数据量场景下的页面更新耗时测试</p></blockquote><p>首先还是在无后台数据场景下使用<code>新增可用券(1000)</code>将可用券数量递增至5000：</p><table tabindex="0"><thead><tr><th></th><th>1000</th><th>2000</th><th>3000</th><th>4000</th><th>5000</th></tr></thead><tbody><tr><td>native</td><td>332.6</td><td>350</td><td>412.6</td><td>498.2</td><td>569.4</td></tr><tr><td>wepy2</td><td>970.2</td><td>1531.4</td><td>2015.2</td><td>2890.6</td><td>3364.2</td></tr><tr><td>uniapp</td><td>655.2</td><td>593.4</td><td>655</td><td>675.6</td><td>718.8</td></tr><tr><td>mpx</td><td>532.2</td><td>496</td><td>548.6</td><td>564</td><td>601.8</td></tr><tr><td>chameleon</td><td>805.4</td><td>839.6</td><td>952.8</td><td>1086.6</td><td>1291.8</td></tr></tbody></table><p>然后点击<code>新增不可用券(5000)</code>将后台数据量增加至5000，再测试可用券数量递增至5000的耗时：</p><table tabindex="0"><thead><tr><th></th><th>back add(5000)</th></tr></thead><tbody><tr><td>native</td><td>117.4</td></tr><tr><td>wepy2</td><td>511.6</td></tr><tr><td>uniapp</td><td>285</td></tr><tr><td>mpx</td><td>0</td></tr><tr><td>chameleon</td><td>824</td></tr></tbody></table><table tabindex="0"><thead><tr><th></th><th>1000</th><th>2000</th><th>3000</th><th>4000</th><th>5000</th></tr></thead><tbody><tr><td>native</td><td>349.8</td><td>348.4</td><td>430.4</td><td>497</td><td>594.8</td></tr><tr><td>wepy2</td><td>1128</td><td>1872</td><td>2470.4</td><td>3263.4</td><td>4075.8</td></tr><tr><td>uniapp</td><td>715</td><td>666.8</td><td>709.2</td><td>755.6</td><td>810.2</td></tr><tr><td>mpx</td><td>538.8</td><td>501.8</td><td>562.6</td><td>573.6</td><td>595.2</td></tr><tr><td>chameleon</td><td>1509.2</td><td>1672.4</td><td>1951.8</td><td>2232.4</td><td>2586.2</td></tr></tbody></table><p>该项测试的结论为：<br> native &gt; mpx &gt; uniapp &gt; chameleon &gt; wepy2</p><p>结论分析：</p><ul><li>在大数据量场景下，框架之间基础性能的差异会变得更加明显，mpx和uniapp依然保持了接近原生的良好性能表现，而chameleon和wepy2则产生了比较显著的性能劣化。</li></ul><h3 id="局部更新耗时" tabindex="-1">局部更新耗时 <a class="header-anchor" href="#局部更新耗时" aria-label="Permalink to &quot;局部更新耗时&quot;">​</a></h3><p>我们在可用券数量为1000的情况下，点击任意一张可用券触发选中状态，以测试局部更新性能</p><table tabindex="0"><thead><tr><th></th><th>toggleSelect(ms)</th></tr></thead><tbody><tr><td>native</td><td>2</td></tr><tr><td>wepy2</td><td>2.6</td></tr><tr><td>uniapp</td><td>2.8</td></tr><tr><td>mpx</td><td>2.2</td></tr><tr><td>chameleon</td><td>2</td></tr><tr><td>mpvue</td><td>289.6</td></tr><tr><td>kbone</td><td>2440.8</td></tr><tr><td>taro next</td><td>1975</td></tr></tbody></table><p>该项测试的结论为：<br> native ≈ chameleon ≈ mpx ≈ wepy2 ≈ uniapp &gt; mpvue &gt; taro next &gt; kbone</p><p>结论分析：</p><ul><li>可以看出所有使用了原生自定义组件进行组件化实现的框架局部更新耗时都极低，这足以证明小程序原生自定义组件的优秀性和重要性；</li><li>mpvue由于使用了页面更新，局部更新耗时显著增加；</li><li>kbone和taro next由于递归动态渲染的性能开销巨大，导致局部更新耗时同样巨大。</li></ul><h3 id="setdata调用" tabindex="-1">setData调用 <a class="header-anchor" href="#setdata调用" aria-label="Permalink to &quot;setData调用&quot;">​</a></h3><p>我们将<code>proxySetData</code>的count和size选项设置为true，开启setData的次数和体积统计，重新构建后按照以下流程执行系列操作，并统计setData的调用次数和发送数据的体积。</p><p>操作流程如下：</p><ol><li>100逐级递增可用券(0-&gt;500)</li><li>切换至不可用券</li><li>新增不可用券(1000)</li><li>100逐级递增可用券(500-&gt;1000)</li><li>更新可用券(all)</li><li>切换至可用券</li></ol><p>操作完成后我们使用<code>getCount</code>和<code>getSize</code>方法获取累积的setData调用次数和数据体积，其中数据体积计算方式为JSON.stringify后按照utf-8编码方式进行体积计算，统计结果为：</p><table tabindex="0"><thead><tr><th></th><th>count</th><th>size(KB)</th></tr></thead><tbody><tr><td>native</td><td>14</td><td>803</td></tr><tr><td>wepy2</td><td>3514</td><td>1124</td></tr><tr><td>mpvue</td><td>16</td><td>2127</td></tr><tr><td>uniapp</td><td>14</td><td>274</td></tr><tr><td>mpx</td><td>8</td><td>261</td></tr><tr><td>chameleon</td><td>2515</td><td>319</td></tr><tr><td>kbone</td><td>22</td><td>10572</td></tr><tr><td>taro next</td><td>9</td><td>2321</td></tr></tbody></table><p>该项测试的结论为：<br> mpx &gt; uniapp &gt; native &gt; chameleon &gt; wepy2 &gt; taro next &gt; mpvue &gt; kbone</p><p>结论分析：</p><ul><li>mpx框架成功实现了理论上setData的最优；</li><li>uniapp由于缺失模板追踪能力紧随其后；</li><li>chameleon由于组件每次创建时都会进行一次不必要的setData，产生了大量无效setData调用，但是数据的发送本身经过diff，在数据发送量上表现不错；</li><li>wepy2的组件会在数据更新时调用setData发送已经更新过的props数据，因此也产生了大量无效调用，且diff精度不足，发送的数据量也较大；</li><li>taro next由于上层完全基于vue，在数据发送次数上控制到了9次，但由于需要发送大量的dom描述信息，数据发送量较大；</li><li>mpvue由于使用较长的数据路径描述数据对应的组件，也产生了较大的数据发送量；</li><li>kbone对于setData的调用控制得不是很好，在上层运行vue的情况依然进行了22次数据发送，且发送的数据量巨大，在此流程中达到了惊人的10MB。</li></ul><h3 id="页面渲染耗时-静态测试" tabindex="-1">页面渲染耗时(静态测试) <a class="header-anchor" href="#页面渲染耗时-静态测试" aria-label="Permalink to &quot;页面渲染耗时(静态测试)&quot;">​</a></h3><p>此处的页面渲染耗时与前面描述的动态测试场景中相同，测试结果如下：</p><table tabindex="0"><thead><tr><th></th><th>页面渲染耗时</th></tr></thead><tbody><tr><td>native</td><td>70.4</td></tr><tr><td>wepy2</td><td>86.6</td></tr><tr><td>mpvue</td><td>115.2</td></tr><tr><td>uniapp</td><td>69.6</td></tr><tr><td>mpx</td><td>66.6</td></tr><tr><td>chameleon</td><td>65</td></tr><tr><td>kbone</td><td>144.2</td></tr><tr><td>taro next</td><td>119.8</td></tr></tbody></table><p>该项测试的结论为：<br> chameleon ≈ mpx ≈ uniapp ≈ native &gt; wepy2 &gt; mpvue ≈ taro next &gt; kbone</p><p>结论分析：</p><ul><li>除了kbone和taro next采用动态渲染耗时增加，mpvue使用页面模板渲染性能稍差，其余框架的静态页面渲染表现都和原生差不多。</li></ul><h2 id="结论" tabindex="-1">结论 <a class="header-anchor" href="#结论" aria-label="Permalink to &quot;结论&quot;">​</a></h2><p>综合上述测试数据，我们得到最终的小程序框架运行时性能排名为：<br> mpx &gt; uniapp &gt; chameleon &gt; wepy2 &gt; mpvue &gt; taro next &gt; kbone</p><h2 id="一点私货" tabindex="-1">一点私货 <a class="header-anchor" href="#一点私货" aria-label="Permalink to &quot;一点私货&quot;">​</a></h2><p>虽然kbone和taro next采用了动态渲染技术在性能表现上并不尽如人意，但是我依然认为这是很棒的技术方案。虽然本文从头到位都在进行性能测试和对比，但性能并不是框架的全部，开发效率和高可用性仍然是框架的重心，开发效率相信是所有框架设计的初衷，但是高可用性却在很大程度被忽视。从这个角度来说，kbone和taro next是非常成功的，不同于过去的转译思路，这种从抹平底层渲染环境的做法能够使上层web框架完整运行，在框架可用性上带来非常大的提升，非常适合于运营类简单小程序的迁移和开发。</p><p>我主导开发的mpx框架(<a href="https://github.com/didi/mpx" target="_blank" rel="noreferrer">https://github.com/didi/mpx</a>) 选择了另一条道路解决可用性问题，那就是基于小程序原生语法能力进行增强，这样既能避免转译web框架时带来的不确定性和不稳定性，同时也能带来非常接近于原生的性能表现，对于复杂业务小程序的开发者来说，非常推荐使用。在跨端输出方面，mpx目前能够完善支持业内全部小程序平台和web平台的同构输出，滴滴内部最重要最复杂的小程序——滴滴出行小程序完全基于mpx进行开发，并利用框架提供的跨端能力对微信和支付宝入口进行同步业务迭代，大大提升了业务开发效率。</p>',99),p=[o];function h(i,l,n,b,m,u){return e(),d("div",null,p)}const k=t(r,[["render",h]]);export{s as __pageData,k as default};
