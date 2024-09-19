import { nodeOops } from './nodeOops';
import patchProp from './patchProp';

import { createRenderer } from '@vue/runtime-core';
const renderOptions = Object.assign(nodeOops, { patchProp });

// render 方法采用 domapi 进行渲染
const render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};

export { renderOptions, render };
export * from '@vue/runtime-core';

// runtime-dom -> runtime-core -> reactivity
