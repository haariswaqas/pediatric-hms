
export const SectionHeader = ({ title, color, isExpanded, onToggle }) => (
    <button 
      onClick={onToggle}
      className={`
        flex justify-between items-center p-3 mb-3 rounded-md 
        text-white font-semibold cursor-pointer 
        ${color}
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
      `}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? `Collapse ${title} section` : `Expand ${title} section`}
    >
      <h3>{title}</h3>
      <span>{isExpanded ? '▼' : '►'}</span>
    </button>
  );