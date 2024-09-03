import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandler';
import { ReactiveFlags } from './constants';

// 用于记录我们的 代理后的结果，可以复用
const reactiveMap = new WeakMap();

/**
 * * 创建响应式对象
 * @param target
 * @returns
 */
function createReactiveObject(target: any) {
  // 统一做判断，target 必须为对象
  if (!isObject(target)) return target;

  // 如果当前 对象已经是响应式对象,则不在做响应式处理
  if (target[ReactiveFlags.ISREACTIVE]) {
    return target;
  }

  // 检查是否存在缓存，存在返回缓存
  const existProxy = reactiveMap.get(target);
  if (existProxy) return existProxy;

  let proxy = new Proxy(target, mutableHandlers);
  // 缓存被代理的对象
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}
