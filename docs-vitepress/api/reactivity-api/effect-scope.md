# Effect 作用域 API

### effectScope

```ts
function effectScope(detached?: boolean): EffectScope;

interface EffectScope {
  run<T>(fn: () => T): T | undefined;
  stop(): void;
  pause(): void;
  resume(): void;
}
```

创建一个 effect 作用域对象，捕获在其内部创建的响应性副作用(例如计算属性或监听器)，可以对这些副作用进行批量处理

```js
import { effectScope } from "@mpxjs/core";

const scope = effectScope();
scope.run(() => {
  const doubled = computed(() => counter.value * 2);

  watch(doubled, () => console.log(doubled.value));

  watchEffect(() => console.log("Count: ", doubled.value));
});

scope.stop();
```

需要注意的是，effectScope 接受一个 detached 参数，默认为 false，该参数来表示当前作用域是否和父级作用域进行分离，若 detached 为 true，
当前 effectScope 则不会被父级作用域收集。

- 暂停侦听

Mpx 提供了 pause 方法可以将整个作用域中的响应性副作用批量暂停侦听。

```js
import { effectScope, onHide } from "@mpxjs/core";
const scope = effectScope();
scope.run(() => {
  const doubled = computed(() => counter.value * 2);

  watch(doubled, () => console.log(doubled.value));

  watchEffect(() => console.log("Count: ", doubled.value));
});

onHide(() => {
  scope.pause();
});
```

- 恢复侦听

被暂停的作用域可以使用 resume 方法来恢复侦听。

```js
import { onShow } from "@mpxjs/core";
// ......

onShow(() => {
  scope.resume();
});
```

### getCurrentScope

```ts
function getCurrentScope(): EffectScope | undefined;
```

返回当前活跃的 effect 作用域。

### onScopeDispose

```ts
function onScopeDispose(fn: () => void): void;
```

在当前活跃的 effect 作用域上注册一个处理回调。该回调会在相关的 effect 作用域结束之后被调用。
