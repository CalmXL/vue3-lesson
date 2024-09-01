/**
 * * 副作用函数, 首次执行会将其中的依赖进行收集
 * @param fn       调用的函数
 * @param options  配置项
 * @returns
 */
export function effect(fn, options?) {
  // 创建一个响应式 effect，数据变化后可以重新执行
  // 创建一个 effect, 只要依赖的属性变化了,就要重新执行回调
  const _effect = new ReactiveEffect(fn, () => {
    // scheduler
    _effect.run();
  });

  // 首次执行
  _effect.run();

  if (options) {
    Object.assign(_effect, options); // 用用户传递的覆盖掉内置的
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; // 可以在 run 方法上获取到 effect 的引用
  return runner; // 外界可以自己让其 run
}

export let activeEffect;

/**
 * * 清空依赖情况之前
 * @param effect
 */
function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 每次执行 id 都要 + 1, 如果当前同一个 effect 执行, id 就是相同的
}

/**
 * * 新的依赖收集结束之后, 如果存在多余的旧的effect，则删除
 * @param effect
 */
function postCleanEffect(effect) {
  // [flag, name, xx, bb, zz]
  // [flag]
  if (effect.deps?.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      // 删除映射表中对应的 effect
      cleanDepEffect(effect.deps[i], effect);
    }
    // 更新依赖列表的长度
    effect.deps.length = effect._depsLength;
  }
}

// effectScope.stop() 停止所有的 effect 不参加响应式处理
/**
 * ReactiveEffect 类
 */
class ReactiveEffect {
  public active = true; // 创建的 effect 是响应的
  _trackId = 0; // 用于记录当前 effect 执行了几次
  deps = []; // 用于记录 dep
  _depsLength = 0; // 默认收集个数，用于保证deps顺序

  // fn 用户编写的函数
  // 如果 fn 中依赖数据发生变化，需要重新调用scheduler -> run()
  constructor(public fn, public scheduler) {}

  run() {
    if (!this.active) {
      return this.fn(); // 不做额外的处理
    }

    // 保存上一次的 activeEffect
    let lastEffect = activeEffect;

    try {
      activeEffect = this;

      // effect 重新执行前，需要将上一次的依赖情况 effect.deps 清空
      preCleanEffect(this);
      return this.fn();
    } finally {
      postCleanEffect(this);
      // 执行结束后, 将上一次的 activeEffect 赋值回来
      activeEffect = lastEffect;
    }
  }

  stop() {
    this.active = false;
  }
}

/**
 * 删除旧的 dep
 * @param dep
 * @param effect
 */
function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size == 0) {
    dep.cleanup(); // 如果 map 为空，则删除该属性
  }
}

// 双向记忆
/**
 * 1. _trackId 用于记录执行次数(防止一个属性在当前effect中多次依赖收集) 只收集一次
 * 2. 拿到上一次依赖的最后一个和这次的比较
 * [ flag, name ]
 * [ flag, age ]
 */
/**
 * 重新的收集依赖, 将不需要的移除
 * 收集时一个个的收集
 * @param effect
 * @param dep
 */
export function trackEffect(effect, dep) {
  if (dep.get(effect) !== effect._trackId) {
    // 优化掉了多余的收集
    dep.set(effect, effect._trackId); // 更新 id

    // { flag, name }
    // { flag, age }
    let oldDep = effect.deps[effect._depsLength];

    // 如果没有存过
    if (oldDep !== dep) {
      // 如果老的存在值
      if (oldDep) {
        // 删除掉老的
        cleanDepEffect(oldDep, effect);
      }
      // effect 与 dep 关联起来
      effect.deps[effect._depsLength++] = dep;
    } else {
      effect._depsLength++;
    }
  }

  // effect 关联 dep
  effect.deps[effect._depsLength++] = dep; // 永远按照本次最新的存放
}

/**
 * * 触发 dep 中的 effect
 * @param dep
 */
export function triggerEffects(dep) {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler(); // -> effect.run()
    }
  }
}
