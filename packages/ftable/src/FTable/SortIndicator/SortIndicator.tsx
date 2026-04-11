import './SortIndicator.css';

interface SortIndicatorProps {
  direction: 'asc' | 'desc' | null;
}

export function SortIndicator({ direction }: SortIndicatorProps) {
  if (direction === 'asc') return <span className="ftable__sort-icon ftable__sort-icon--asc" aria-hidden="true">↑</span>;
  if (direction === 'desc') return <span className="ftable__sort-icon ftable__sort-icon--desc" aria-hidden="true">↓</span>;
  return <span className="ftable__sort-icon ftable__sort-icon--none" aria-hidden="true">↕</span>;
}
