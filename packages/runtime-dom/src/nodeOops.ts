// 主要是对节点元素的增删改查

export const nodeOops = {
  // 如果 anchor 为空, 相当于 appendChild
  insert(el, parent, anchor) {
    // container.appendChild(el);
    parent.insertBefore(el, anchor || null);
  },
  remove(el) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  createElement(type) {
    return document.createElement(type);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    node.nodeValue = text;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
};
