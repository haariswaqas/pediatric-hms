import React, { useState, useMemo } from "react";

export default function PrescriptionTable({ items, columns }) {
  const [groupBy, setGroupBy] = useState("prescription"); // default

  // Group the items based on current groupBy
  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      let groupKey;
      let label;
      switch (groupBy) {
        case "patient":
          groupKey = item.prescription_details?.child_id;
          label = `Patient: ${item.prescription_details?.child_first_name} ${item.prescription_details?.child_last_name}`;
          break;
        case "doctor":
          groupKey = item.prescription_details?.doctor_id;
          label = `Doctor: ${item.prescription_details?.doctor_first_name} ${item.prescription_details?.doctor_last_name}`;
          break;
        case "prescription":
        default:
          groupKey = item.prescription_details?.id;
          label = `Prescription ID: ${item.prescription_details?.id}`;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { label, items: [] };
      }
      groups[groupKey].items.push(item);

      return groups;
    }, {});
  }, [items, groupBy]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* GroupBy Selection */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Group by:
        </label>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="prescription">Prescription ID</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map(({ key, label, icon }) => (
                <th
                  key={key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-1">
                    {icon && React.cloneElement(icon, { className: "w-4 h-4" })}
                    {label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Object.keys(groupedItems).map((groupKey) => (
              <React.Fragment key={groupKey}>
                {/* Group header */}
                <tr className="bg-gray-100 dark:bg-gray-900">
                  <td
                    colSpan={columns.length}
                    className="px-6 py-2 text-sm font-medium text-gray-900 dark:text-gray-200"
                  >
                    {groupedItems[groupKey].label}
                  </td>
                </tr>

                {groupedItems[groupKey].items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {columns.map(({ key, render }) => (
                      <td
                        key={`${item.id}-${key}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                      >
                        {render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
