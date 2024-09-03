import { isObject } from '@vue/shared';
import { ReactiveEffect } from './effect';

export function watch(source, cb, options = {} as any) {
  return doWatch(source, cb, options);
}

// 控制 depth 已经到了哪一层
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

  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }

  return source;
}

function doWatch(source, cb, { deep }) {
  let oldValue;
  // source ? -> getter
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);

  // 产生一个可以给 ReactiveEffect 来使用的 getter, 需要对这个对象进行取值操作,会关联当前的 reactiveEffect
  let getter = () => reactiveGetter(source);

  const job = () => {
    const newValue = effect.run();
    cb(newValue, oldValue);
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, job);
  oldValue = effect.run();
}