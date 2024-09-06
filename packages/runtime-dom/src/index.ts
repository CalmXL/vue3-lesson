export * from '@vue/reactivity';

import { nodeOops } from './nodeOops';
import patchProp from './patchProp';

const renderOptions = Object.assign(nodeOops, { patchProp });
function createRenderer() {}

export { renderOptions };
