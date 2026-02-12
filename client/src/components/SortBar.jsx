const SORT_OPTIONS = [
  { value: 'hot', label: 'Hot' },
  { value: 'newest', label: 'New' },
  { value: 'top', label: 'Top' },
  { value: 'controversial', label: 'Controversial' },
];

export default function SortBar({ currentSort, onSortChange }) {
  return (
    <div className="sort-bar">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`sort-btn ${currentSort === option.value ? 'active' : ''}`}
          onClick={() => onSortChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
