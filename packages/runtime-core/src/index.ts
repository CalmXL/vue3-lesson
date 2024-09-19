export function createRenderer(renderOptions) {
  // core 中不关心如何渲染

  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = renderOptions;

  const mountElement = (vnode, container) => {
    const { type, children, props } = vnode;

    let el = hostCreateElement(type);

    hostSetElementText(el, children);

    for (let key in props) {
      hostPatchProp(el, key, null, props[key]);
    }

    hostInsert(el, container);
  };

  const patch = (n1, n2, container) => {
    if (n1 === n2) return; // 相同元素, 跳过

    if (n1 === null) {
      mountElement(n2, container);
    }
  };

  const render = (vnode, container) => {
    // 将虚拟节点 -> 真实节点
    patch(container._vnode || null, vnode, container);

    container._vnode = vnode;
  };

  return { render };
}
