import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { SearchInput } from './SearchInput';

function renderSearch(props: Partial<Parameters<typeof SearchInput>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(<SearchInput value="" onChange={onChange} {...props} />);
  return { onChange, ...utils };
}

function type(value: string) {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('SearchInput', () => {
  it('renders an always-visible searchbox with default label and placeholder', () => {
    renderSearch();
    const input = screen.getByRole('searchbox', { name: 'Search' }) as HTMLInputElement;
    expect(input.placeholder).toBe('Search…');
  });

  it('uses translated label and placeholder', () => {
    renderSearch({ labels: { search: 'Rechercher', searchPlaceholder: 'Rechercher…' } });
    const input = screen.getByRole('searchbox', { name: 'Rechercher' }) as HTMLInputElement;
    expect(input.placeholder).toBe('Rechercher…');
  });

  it('shows typed text immediately without calling onChange before the debounce', () => {
    const { onChange } = renderSearch();
    type('abc');
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('abc');
    act(() => { vi.advanceTimersByTime(299); });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange once after 300ms', () => {
    const { onChange } = renderSearch();
    type('abc');
    act(() => { vi.advanceTimersByTime(300); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('restarts the debounce on each keystroke', () => {
    const { onChange } = renderSearch();
    type('a');
    act(() => { vi.advanceTimersByTime(100); });
    type('ab');
    act(() => { vi.advanceTimersByTime(100); });
    type('abc');
    act(() => { vi.advanceTimersByTime(300); });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('applies immediately on Enter and does not fire again later', () => {
    const { onChange } = renderSearch();
    type('abc');
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('abc');
    act(() => { vi.advanceTimersByTime(300); });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears immediately via the clear button', () => {
    const { onChange } = renderSearch({ value: 'foo' });
    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  });

  it('renders no clear button when empty', () => {
    renderSearch();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('reflects an external value change', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchInput value="" onChange={onChange} />);
    rerender(<SearchInput value="bar" onChange={onChange} />);
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('bar');
  });
});
