/**
 * Joins truthy class name strings, filtering out falsy values.
 * Equivalent to the popular `clsx` / `classnames` packages without the dependency.
 *
 * @example
 * cx('foo', isActive && 'foo--active', undefined) // => 'foo foo--active'
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
