import React, { useState } from 'react';
import { ChevronRight, ExternalLink, Edit2 } from 'lucide-react';

export default function InfoCard({ 
  title, 
  icon, 
  items, 
  isEditable = false, 
  onEdit = null,
  footerLink = null,
  highlightEmptyValues = false,
  maxVisible = null
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine which items to display based on maxVisible setting
  const visibleItems = maxVisible && !isExpanded && items.length > maxVisible 
    ? items.slice(0, maxVisible) 
    : items;
  
  const hasMoreItems = maxVisible && items.length > maxVisible;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
      {/* Card Header */}
      <div className="px-4 py-3 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
              {icon}
            </div>
          )}
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
        </div>
        
        {isEditable && onEdit && (
          <button 
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Edit ${title}`}
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-4">
        {items.length > 0 ? (
          <dl className="space-y-3">
            {visibleItems.map((item, index) => {
              const isEmpty = !item.value || item.value === '–';
              const isHighlighted = isEmpty && highlightEmptyValues;
              
              return (
                <div 
                  key={index} 
                  className={`
                    ${index !== visibleItems.length - 1 ? "pb-3 border-b border-gray-100 dark:border-gray-700" : ""}
                    ${isHighlighted ? "bg-blue-50 dark:bg-blue-900/20 -mx-4 px-4 py-2 rounded" : ""}
                    transition-colors
                  `}
                >
                  <div className="flex justify-between items-baseline">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {item.label}
                    </dt>
                    
                    {item.timestamp && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {item.timestamp}
                      </span>
                    )}
                  </div>
                  
                  <dd className={`
                    mt-1 text-sm font-medium
                    ${isEmpty 
                      ? "text-gray-400 dark:text-gray-500 italic" 
                      : "text-gray-800 dark:text-gray-200"}
                    ${item.highlight ? "text-blue-600 dark:text-blue-400" : ""}
                  `}>
                    {item.prefix && <span className="text-gray-500 mr-1">{item.prefix}</span>}
                    {item.value || "Not provided"}
                    {item.suffix && <span className="text-gray-500 ml-1">{item.suffix}</span>}
                    
                    {item.status && (
                      <span className={`
                        ml-2 px-2 py-0.5 text-xs rounded-full inline-block
                        ${item.status === 'normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                        ${item.status === 'warning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                        ${item.status === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                      `}>
                        {item.statusText || item.status}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 italic py-2">
            No information available
          </p>
        )}
        
        {/* Show more/less toggle button */}
        {hasMoreItems && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
          >
            <span>{isExpanded ? 'Show less' : `Show ${items.length - maxVisible} more`}</span>
            <ChevronRight size={16} className={`ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
      
      {/* Optional Footer */}
      {footerLink && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
          <a 
            href={footerLink.url} 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-center sm:justify-start transition-colors"
          >
            {footerLink.icon && <span className="mr-1">{footerLink.icon}</span>}
            {footerLink.text}
            <ExternalLink size={12} className="ml-1" />
          </a>
        </div>
      )}
    </div>
  );
}