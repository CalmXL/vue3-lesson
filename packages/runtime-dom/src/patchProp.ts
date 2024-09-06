// 主要是对节点元素的属性的操作 class style event
import { patchEvent } from './modules/patchEvent';
import { patchClass } from './modules/patchClass';
import { patchStyle } from './modules/patchStyle';
import { patchAttr } from './modules/patchAttr';

export default function patchProp(el, key, prevValue, nextValue) {
  if (key === 'class') {
    return patchClass(el, nextValue);
  } else if (key === 'style') {
    // { color: red } { background: red }
    return patchStyle(el, prevValue, nextValue);
  } else if (/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue);
  } else {
    return patchAttr(el, key, nextValue);
  }
}
