function createInvoker(value) {
  const invoker = (e) => invoker.value(e);
  invoker.value = value;

  return invoker;
}

export function patchEvent(el, name, nextValue) {
  // div click = () => fn1() -> fn2()

  // vue_event_invoker
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase();

  const existedInvoker = invokers[name];

  if (nextValue && existedInvoker) {
    // 事件换绑
    return (existedInvoker.value = nextValue);
  }

  if (nextValue) {
    // 创建一个调用函数, 并且内部会执行 nextValue
    const invoker = (invokers[name] = createInvoker(nextValue));
    return el.addEventListener(eventName, invoker);
  }

  if (existedInvoker) {
    // 移除事件
    el.removeEventListener(name, existedInvoker);
    invokers[name] = undefined;
  }
}
