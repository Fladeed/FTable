import { useState } from 'react';

export interface PillState {
  value: string;
  isOpen: boolean;
  isClosing: boolean;
  handlePillClick: (key: string) => void;
  handleValueChange: (key: string, value: string) => void;
  handleClear: (key: string) => void;
  handleClose: (key: string) => void;
}

export function usePill(): PillState {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  function open() { setIsOpen(true); setIsClosing(false); }
  function close() {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 180);
  }

  function handlePillClick(_key: string) { isOpen ? close() : open(); }
  function handleValueChange(_key: string, v: string) { setValue(v); }
  function handleClear(_key: string) { setValue(''); }
  function handleClose(_key: string) { close(); }

  return { value, isOpen, isClosing, handlePillClick, handleValueChange, handleClear, handleClose };
}
