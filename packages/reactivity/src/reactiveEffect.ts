// 收集的结构
// {  weakMap
//    {name: 'xl', age: 27 }: {  => Map
//     name: [effect1, effect2],
//     age: [effect]
//   }
// }
import { activeEffect, trackEffect, triggerEffects } from './effect';

const targetMap = new WeakMap();

export const createDep = (cleanup, key) => {
  const dep = new Map() as any; // 创建的收集器还是一个 Map
  dep.cleanup = cleanup;
  dep.name = key; // 自定义的为了标识这个映射表是给哪个属性服务的
  return dep;
};

export function track(target, key) {
  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));
  }

  // 将 effect 放入到 dep 映射表，后续可以根值的变化来触发此 dep 中存放的 effect
  activeEffect && trackEffect(activeEffect, dep);
}

export function trigger(target, key, value, oldValue) {
  const deps = targetMap.get(target);

  if (!deps) return;

  let dep = deps.get(key);

  if (dep) {
    triggerEffects(dep);
  }
}
