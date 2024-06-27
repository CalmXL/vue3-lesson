export function effect (fn, options?) {

  // 创建一个响应式 effect，数据变化后可以重新执行
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });

  _effect.run();

  return _effect;
}

export let activeEffect;
class ReactiveEffect {
  active = true; // 创建的 effect 是响应的
  // fn 用户编写的函数
  // 如果 fn 中依赖数据发生变化，需要重新调用 -> run()
  constructor(public fn, public scheduler) {
  }

  run () {
    if(!this.active) {
      return this.fn();
    }

    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
       activeEffect = lastEffect;
    }
  }
}