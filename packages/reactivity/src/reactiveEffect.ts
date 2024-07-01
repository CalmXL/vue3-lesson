// 收集的结构
// {  weakMap
//    {name: 'xl', age: 27 }: {  => weakMap
//     name: [effect1, effect2],
//     age: [effect]
//   }
// }
import { activeEffect } from './effect';

const targetMap = new WeakMap();


export function track (target, key) {
  // console.log(target, key, activeEffect);

  let depsMap = targetMap.get(target);

  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, new Map());
  }

  console.log(depsMap);
}