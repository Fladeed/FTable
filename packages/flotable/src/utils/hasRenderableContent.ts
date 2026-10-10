import { Fragment, isValidElement } from 'react';
import type { ReactNode } from 'react';

/**
 * Returns false for slot content that would render nothing visible: `null`, `undefined`, booleans,
 * `''`, `0`, `NaN`, and arrays or fragments made only of those. `0` and `NaN` are excluded so that
 * `items.length && <Picker />` does not leak a stray "0" into a slot.
 *
 * Any other element counts as content, even a component that returns `null` (its output
 * cannot be known before rendering).
 *
 * @example
 * hasRenderableContent(<></>)         // => false
 * hasRenderableContent([null, false]) // => false
 * hasRenderableContent(<Picker />)    // => true
 */
export function hasRenderableContent(node: ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false;
  if (typeof node === 'string') return node !== '';
  if (typeof node === 'number') return node !== 0 && !Number.isNaN(node);
  if (Array.isArray(node)) return node.some(hasRenderableContent);
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) {
    return hasRenderableContent(node.props.children);
  }
  return true;
}
