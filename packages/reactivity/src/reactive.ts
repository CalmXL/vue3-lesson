import {isObject} from "@vue/shared";

// 用于记录我们的 代理后的结果，可以复用
const reactiveMap = new WeakMap();
enum ReactiveFlags {
    ISREACTIVE = '__v_isReactive',
}

const mutableHandlers: ProxyHandler<any> = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.ISREACTIVE) return true;
    },
    set(target, key, value, receiver) {
        return false;
    }
}

export function reactive(target) {
    return createReactiveObject(target);
}

function createReactiveObject(target: any) {
    // 统一做判断，target 必须为对象
    if (!isObject(target)) return target;

    if (target[ReactiveFlags.ISREACTIVE]) {
        return target;
    }

    // 检查是否存在缓存，存在返回缓存
    const existProxy = reactiveMap.get(target);
    if (existProxy) return existProxy;

    let proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
}