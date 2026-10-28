import { describe, it, expect } from 'vitest';
import { depsEqual } from './tableUtils';

describe('depsEqual', () => {
  it('treats two undefined deps as equal', () => {
    expect(depsEqual(undefined, undefined)).toBe(true);
  });

  it('treats arrays with the same primitives as equal', () => {
    expect(depsEqual(['a', 1], ['a', 1])).toBe(true);
  });

  it('detects a changed value', () => {
    expect(depsEqual(['a'], ['b'])).toBe(false);
  });

  it('detects a changed length', () => {
    expect(depsEqual(['a'], ['a', 'b'])).toBe(false);
  });

  it('treats undefined and an array as different', () => {
    expect(depsEqual(undefined, [])).toBe(false);
  });

  it('compares with Object.is (NaN equals NaN)', () => {
    expect(depsEqual([NaN], [NaN])).toBe(true);
  });
});
