import { isObject } from '@vue/shared';
import { track, trigger } from './reactiveEffect';
import { reactive } from './reactive';
import { ReactiveFlags } from './constants';

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.ISREACTIVE) return true;
    // 依赖收集
    debugger;
    track(target, key);
    // 取值，响应式属性 和 effect 映射
    let res = Reflect.get(target, key, receiver);
    if (isObject(res)) {
      // 取的值也是对象的时候，递归代理
      return reactive(res);
    }
    return res;
  },
  set(target, key, value, receiver) {
    // 找到属性，让对应的 effect 重新执行
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return result;
  },
};
