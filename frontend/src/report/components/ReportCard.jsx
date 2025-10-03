import React from 'react';
import { Download, Trash2, FileText, FileSpreadsheet, FilePieChart, File } from 'lucide-react';

const getReportIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'spreadsheet':
    case 'excel':
    case 'csv':
      return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
    case 'pdf':
    case 'document':
      return <FileText className="h-12 w-12 text-blue-500" />;
    case 'chart':
    case 'graph':
    case 'analytics':
      return <FilePieChart className="h-12 w-12 text-purple-500" />;
    default:
      return <File className="h-12 w-12 text-gray-500" />;
  }
};

// Function to get a color based on report type
const getTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'spreadsheet':
    case 'excel':
    case 'csv':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pdf':
    case 'document':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'chart':
    case 'graph':
    case 'analytics':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function ReportCard({ report, formatTimeAgo, onDownload, onDelete }) {
  const typeColorClass = getTypeColor(report.report_type);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-4">
            {getReportIcon(report.report_type)}
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg line-clamp-1" title={report.title}>
                {report.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColorClass}`}>
                {report.report_type}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTimeAgo(report.created_at)}
          </span>
          
          <div className="flex space-x-2">
            <button
              onClick={onDownload}
              className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
              title="Download"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}