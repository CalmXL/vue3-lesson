import { activeEffect, trackEffect, triggerEffects } from './effect';
import { toReactive } from './reactive';
import { createDep } from './reactiveEffect';

// ref shallowRef
export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true; // 增加 ref 表示
  public _value; // 用来保存 ref 的值
  public dep; // 用于收集对应的 effect
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;

      triggerRefValue(this);
    }
  }
}

function trackRefValue(ref) {
  if (activeEffect) {
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), 'undefined'))
    );
  }
}

function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep);
  }
}
