/**
 * 1. effect 外部的属性访问 不进行收集
 */

import {
  reactive,
  effect
} from "../packages/reactivity/dist/reactivity.js";

const obj = {
  name: 'xl',
  age: 28
}

// class ReactiveEffect {
//   run () {
//     try {
//       activeEffect = this;
//       return this.fn();
//     } finally {
//       将 activeEffect 赋值为 undefined, 这样 effect 外部的就不会收集依赖了
//       activeEffect = undefined;
//     }
//   }
// }


const state = reactive(obj);

/**
 * 2. effect 嵌套, 当嵌套的下面还有依赖需要收集，收集问题
 *    我们在 effect1 中嵌套一个 effect2 当这个 effect2 执行完毕后，我们会将 activeEffect = undefined.
 *    这会导致 age 不会被 收集到 effect1 中
 *
 *    因此我们需要保存进入 effect2 上一次的 effect
 *
 *    let lastEffect = activeEffect;
 *
 *    当我们收集完依赖后，将外层保存的 effect, 重新赋值给 activeEffect, 这样我们可以继续收集下面的 key
 *    activeEffect = lastEffect;
 */

// class ReactiveEffect {
//   run () {
//     let lastEffect = activeEffect;
//     try {
//       activeEffect = this;
//       return this.fn();
//     } finally {
//       当我们收集完依赖后，将外层保存的 effect, 重新赋值给 activeEffect, 这样我们可以继续收集下面的 key
//       activeEffect = lastEffect;
//     }
//   }
// }


effect(() => { // effect1
  console.log(state.name);

  effect(() => { // effect2
    console.log(state.name);
  })

  console.log(state.age);
})

