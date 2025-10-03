import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Filter } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ParametersTable({ parameters, groupBy }) {
    const getStatusIcon = (status) => {
      switch (status?.toLowerCase()) {
        case 'normal':
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'abnormal':
        case 'high':
        case 'low':
          return <AlertTriangle className="w-4 h-4 text-red-600" />;
        default:
          return <XCircle className="w-4 h-4 text-gray-600" />;
      }
    };
  
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'normal':
          return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
        case 'abnormal':
        case 'high':
        case 'low':
          return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
        default:
          return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
      }
    };
  
    // Group parameters based on groupBy value
    const groupedParameters = () => {
      if (groupBy === 'none') return { 'All Results': parameters };
  
      return parameters.reduce((groups, param) => {
        let groupKey = 'Unknown';
  
        switch (groupBy) {
          case 'status':
            groupKey = param.status || 'Unknown';
            break;
          case 'parameter':
            groupKey = param.reference_range_details?.parameter_name || 'Unknown';
            break;
          case 'doctor':
            groupKey = param.doctor_details?.name || 'Unknown';
            break;
          case 'child':
            groupKey = param.child_details?.name || 'Unknown';
            break;
          case 'lab_tech':
            groupKey = param.lab_tech_details?.name || 'Unknown';
            break;
          case 'age_group':
            const age = param.child_details?.age || 0;
            if (age < 2) groupKey = '0-2 years';
            else if (age < 6) groupKey = '2-6 years';
            else if (age < 12) groupKey = '6-12 years';
            else if (age < 18) groupKey = '12-18 years';
            else groupKey = '18+ years';
            break;
        }
  
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(param);
        return groups;
      }, {});
    };
  
    const grouped = groupedParameters();
  
    // Determine which columns to show
    const allColumns = [
      { key: 'child', label: 'Patient' },
      { key: 'doctor', label: 'Doctor' },
      { key: 'lab_tech', label: 'Lab Tech' },
      { key: 'parameter', label: 'Parameter' },
      { key: 'result', label: 'Result' },
      { key: 'status', label: 'Status' },
      { key: 'referenceRange', label: 'Reference Range' },
    ];
  
    const visibleColumns = allColumns.filter(col => {
      // Hide the grouped column from table
      return !(groupBy === col.key);
    });
  
    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([groupName, groupParams]) => (
          <div
            key={groupName}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {groupBy !== 'none' && (
              <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {groupName} ({groupParams.length} results)
                </h3>
              </div>
            )}
  
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    {visibleColumns.map(({ label }) => (
                      <th key={label} className="px-6 py-4 text-left">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          {label}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {groupParams.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                        idx % 2 === 0
                          ? 'bg-white dark:bg-slate-800'
                          : 'bg-slate-50/50 dark:bg-slate-800/50'
                      }`}
                    >
                      {/* Patient */}
                      {groupBy !== 'child' && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {p.child_details?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Age: {p.child_details?.age || 'N/A'} yrs
                            </span>
                          </div>
                        </td>
                      )}
  
                      {/* Doctor */}
                      {groupBy !== 'doctor' && (
                        <td className="px-6 py-4 text-slate-900 dark:text-white">
                          {p.doctor_details?.name || 'N/A'}
                        </td>
                      )}
  
                      {/* Lab Tech */}
                      {groupBy !== 'lab_tech' && (
                        <td className="px-6 py-4 text-slate-900 dark:text-white">
                          {p.lab_tech_details?.name || 'N/A'}
                        </td>
                      )}
  
                      {/* Parameter */}
                      {groupBy !== 'parameter' && (
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {p.reference_range_details?.parameter_name || 'Unknown'}
                          </span>
                        </td>
                      )}
  
                      {/* Result */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                          {p.value} {p.unit}
                        </span>
                      </td>
  
                      {/* Status */}
                      {groupBy !== 'status' && (
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              p.status
                            )}`}
                          >
                            {getStatusIcon(p.status)}
                            {p.status || 'Unknown'}
                          </div>
                        </td>
                      )}
  
                      {/* Reference Range */}
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {p.reference_range_details?.normal_range || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
  <Link
    to={`/labs/edit-lab-result-parameter/${p.id}`}
    className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600"
  >
    <Pencil className="w-4 h-4 mr-1" /> Edit
  </Link>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }