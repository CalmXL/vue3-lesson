export function effect(fn, options?) {
  // 创建一个响应式 effect，数据变化后可以重新执行
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });

  _effect.run();

  return _effect;
}

export let activeEffect;

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 每次执行 id 都要 + 1, 如果当前同一个 effect 执行, id 就是相同的
}

function postCleanEffect(effect) {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      // 删除映射表中对应的 effects
      cleanDepEffect(effect.deps[i], effect);
    }
    // 更新依赖列表的长度
    effect.deps.length = effect._depsLength;
  }
}

// effectScope.stop() 停止所有的 effect 不参加响应式处理
class ReactiveEffect {
  _trackId = 0; // 用于记录当前 effect 执行了几次
  deps = [];
  _depsLength = 0;

  active = true; // 创建的 effect 是响应的
  // fn 用户编写的函数
  // 如果 fn 中依赖数据发生变化，需要重新调用 -> run()
  constructor(public fn, public scheduler) {}

  run() {
    if (!this.active) {
      return this.fn();
    }

    let lastEffect = activeEffect;
    try {
      activeEffect = this;

      // effect 重新执行前，需要将上一次的依赖情况 effect.deps 清空
      preCleanEffect(this);

      return this.fn();
    } finally {
      postCleanEffect(effect);
      activeEffect = lastEffect;
    }
  }

  stop() {
    this.active = false;
  }
}

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size == 0) {
    dep.cleanup();
  }
}

// 双向记忆
/**
 * 1. _trackId 用于记录执行次数(防止一个属性在当前effect中多次依赖收集) 只收集一次
 * 2. 拿到上一次依赖的最后一个和这次的比较
 */

export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId); // 更新 id
    // console.log('优化多于的收集');
    let oldDep = effect.deps[effect._depsLength];
    if (oldDep !== dep) {
      if (oldDep) {
        // 删除掉老 的
        cleanDepEffect(oldDep, effect);
      }
      // 换成新的
      effect.deps[effect._depsLength++] = dep;
    } else {
      effect._depsLength++;
    }
  }

  // effect 关联 dep
  effect.deps[effect._depsLength++] = dep;
}

export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler(); // -> effect.run()
    }
  }
}
