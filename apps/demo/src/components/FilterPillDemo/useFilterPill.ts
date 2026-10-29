import { useState } from 'react';

export interface PillState {
  value: string;
  isOpen: boolean;
  handlePillClick: (key: string) => void;
  handleValueChange: (key: string, value: string) => void;
  handleClear: (key: string) => void;
  handleClose: (key: string) => void;
}

export function useFilterPill(): PillState {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  function open() { setIsOpen(true); }
  function close() { setIsOpen(false); }

  function handlePillClick(_key: string) { isOpen ? close() : open(); }
  function handleValueChange(_key: string, v: string) { setValue(v); }
  function handleClear(_key: string) { setValue(''); }
  function handleClose(_key: string) { close(); }

  return { value, isOpen, handlePillClick, handleValueChange, handleClear, handleClose };
}
