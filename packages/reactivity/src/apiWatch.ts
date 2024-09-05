import { isFunction, isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from './reactive';
import { isRef } from './ref';

/**
 * * watch 侦听器
 * @param source 一个对象
 * @param cb 回调
 * @param options
 * @returns
 */
export function watch(source, cb, options = {} as any) {
  return doWatch(source, cb, options);
}

export function watchEffect(source, options = {} as any) {
  return doWatch(source, null, options);
}

/**
 * * 遍历对象的所有属性并触发这些属性的 getter，从而建立依赖关系
 * @param source 对象(响应式的)
 * @param depth 是否进行深度观察
 * @param currentDepth
 * @param seen 用于保存追踪过得属性, 防止循环引用
 * @returns
 */
function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source;
  }

  if (depth) {
    if (currentDepth >= depth) {
      return source;
    }

    currentDepth++; // 根据 deep 属性来看是否深度
  }

  if (seen.has(source)) {
    return source;
  }

  seen.add(source);

  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }

  return source;
}

/**
 * * doWatch
 * @param source
 * @param cb
 * @param param2 options 配置项
 */
function doWatch(source, cb, { deep, immediate }) {
  let oldValue;
  // source ? -> getter
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);

  // 产生一个可以给 ReactiveEffect 来使用的 getter, 需要对这个对象进行取值操作,会关联当前的 reactiveEffect
  let getter;

  if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isRef(source)) {
    getter = () => source.value;
  } else if (isFunction(source)) {
    getter = source;
  }

  let clean;
  const onCleanup = (fn) => {
    clean = () => {
      fn();
      clean = undefined;
    };
  };

  const job = () => {
    if (cb) {
      const newValue = effect.run();

      if (clean) {
        clean(); // 在执行回调前, 先调用上一次清理
      }

      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  const effect = new ReactiveEffect(getter, job);

  if (cb) {
    if (immediate) {
      job();
    } else {
      oldValue = effect.run();
    }
  } else {
    // watchEffect 直接执行
    effect.run();
  }

  const unwatch = () => {
    effect.stop();
  };

  return unwatch;
}
