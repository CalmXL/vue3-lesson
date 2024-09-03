import { isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';

class ComputeRefImpl {
  public _value;
  public effect;
  public dep;

  constructor(getter, public setter) {
    // 我们需要创建一个 effect 来管理当前计算属性的 dirty
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        // 计算属性的值变化, 我们应该触发 effect 渲染
        triggerRefValue(this); // 依赖的属性变化后,需要重新渲染,需要将dirty 变为 true
      }
    );
  }

  get value() {
    // 当前 effect 为 dirty 则进行 run, 并保存到 _value
    if (this.effect.dirty) {
      this._value = this.effect.run();

      // 如果当前在 effect 中访问了计算属性, 计算属性收集这个 effect
      trackRefValue(this);
    }
    // 不脏, 则直接返回缓存的值
    return this._value;
  }

  set value(v) {
    this.setter(v);
  }
}

/**
 * * 计算属性
 * @param getterOrOptions 参数接收一个计算属性 getter 或一个具有 get 和 set 方法的对象
 * @returns
 */
export function computed(getterOrOptions) {
  let onlyGetter = isFunction(getterOrOptions);

  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputeRefImpl(getter, setter);
}
