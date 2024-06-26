/**
 * Proxy 和 Reflect 配套解决的问题
 *
 *  1. 如果不使用 Reflect, 使用 target[key]
 *    那么我们访问 aliasName 的时候，只会触发 aliasName, this 指向 person,
 *    并不具有响应式,而其中的 this.name 并不会触发 get 操作
 *  2. Reflect.get(value, key, receiver)
 *    receiver: 如果 target 对象中指定了 getter, receiver 则为 getter 调用时的 this 值。
 */

const person = {
  name: 'xl',
  get aliasName() {
    // target[key]: 此时的 this 指向 person, 并没有代理过，因此不会触发 get 操作
    // Reflect.get(target, key, receiver) this 指向 p, 具有响应式，因此可以触发 get
    // console.log(this === person);
    return this.name + 'handsome'
  }
}

const p = new Proxy(person, {
  // receiver 是代理对象
  get(target, key, receiver) {
    console.log(key);
    // return target[key]; // person.name 不会触发 get
    return Reflect.get(target, key, receiver);
  }
})

console.log(p.aliasName);
// console.log(person.aliasName);