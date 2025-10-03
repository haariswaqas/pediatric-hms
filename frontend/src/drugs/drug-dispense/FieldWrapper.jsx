

export default function Field({ icon, label, children }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        <span className="text-gray-400 dark:text-gray-500 mr-2">{icon}</span>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      </div>
      {children}
    </div>
  );
}
