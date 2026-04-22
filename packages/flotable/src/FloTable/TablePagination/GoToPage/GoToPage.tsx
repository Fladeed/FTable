import { useState, useEffect } from 'react';
import './GoToPage.css';

interface GoToPageProps {
  currentPage: number;
  totalPages: number;
  onGoToPage: (page: number) => void;
  label?: string;
  buttonLabel?: string;
}

export function GoToPage({
  currentPage,
  totalPages,
  onGoToPage,
  label = 'Go to page',
  buttonLabel = 'Go',
}: GoToPageProps) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  function commit() {
    const parsed = parseInt(inputValue, 10);
    const clamped = isNaN(parsed) ? currentPage : Math.min(Math.max(parsed, 1), totalPages);
    setInputValue(String(clamped));
    if (clamped !== currentPage) onGoToPage(clamped);
  }

  return (
    <span className="flotable-go-to-page">
      <span className="flotable-go-to-page__label">{label}</span>
      <input
        type="number"
        className="flotable-go-to-page__input"
        value={inputValue}
        min={1}
        max={totalPages}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setInputValue(String(currentPage));
        }}
      />
      <button className="flotable-go-to-page__btn" onClick={commit}>
        {buttonLabel} ›
      </button>
    </span>
  );
}
