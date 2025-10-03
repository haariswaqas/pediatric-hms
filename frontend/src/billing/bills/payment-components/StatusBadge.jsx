// Status badge component
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    completed: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500"
    },
    pending: {
      bg: "bg-amber-50 dark:bg-amber-900/20", 
      text: "text-amber-700 dark:text-amber-300",
      dot: "bg-amber-500"
    },
    failed: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-300", 
      dot: "bg-red-500"
    },
    default: {
      bg: "bg-gray-50 dark:bg-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      dot: "bg-gray-400"
    }
  };

  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
    </span>
  );
};
