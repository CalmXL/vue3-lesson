import {activeEffect} from "./effect";
import {track, trigger} from "./reactiveEffect";

export enum ReactiveFlags {
  ISREACTIVE = '__v_isReactive',
}

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.ISREACTIVE) return true;
    // TODO 依赖收集
    track(target, key);
    // 取值，响应式属性 和 effect 映射
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 设置，让对应的 effect 重新执行
    // TODO 触发更新
    let oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return result;
  }
}
