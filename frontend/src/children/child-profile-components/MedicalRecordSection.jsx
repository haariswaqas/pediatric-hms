import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Search, Calendar, AlertCircle } from 'lucide-react';

export default function MedicalRecordSection({ 
  title, 
  icon, 
  content, 
  items = [], 
  count = 0,
  itemRenderer,
  onAddNew = null,
  emptyMessage = "No records found."
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const contentRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    
    const renderedItem = itemRenderer ? itemRenderer(item) : null;
    if (!renderedItem) return false;
    
    const searchIn = [
      renderedItem.title,
      renderedItem.subtitle,
      ...(renderedItem.details?.map(d => d.value) || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchIn.includes(searchQuery.toLowerCase());
  });

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      // Focus search input after it becomes visible
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // Clear search when closing
      setSearchQuery('');
    }
  };

  // Animation helper for smooth height transitions
  useEffect(() => {
    if (!contentRef.current) return;
    
    if (isExpanded) {
      const height = contentRef.current.scrollHeight;
      contentRef.current.style.height = '0px';
      contentRef.current.style.opacity = '0';
      
      setTimeout(() => {
        contentRef.current.style.height = `${height}px`;
        contentRef.current.style.opacity = '1';
      }, 50);
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.style.height = 'auto';
        }
      }, 300);
    } else {
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
      
      setTimeout(() => {
        contentRef.current.style.height = '0px';
        contentRef.current.style.opacity = '0';
      }, 50);
    }
  }, [isExpanded]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
      {/* Section header */}
      <div className="flex flex-col">
        <div 
          className="px-4 py-3 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700"
        >
          <button 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-controls={`section-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <span className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex-shrink-0">
              {icon}
            </span>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h3>
            {count > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {count}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
          </button>
          
          <div className="flex items-center space-x-2">
            {items.length > 3 && (
              <button 
                onClick={toggleSearch}
                className={`p-1.5 rounded-full transition-colors ${
                  isSearchVisible 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label={isSearchVisible ? "Close search" : "Search records"}
                title={isSearchVisible ? "Close search" : "Search records"}
              >
                <Search size={16} />
              </button>
            )}
            
            {onAddNew && (
              <button 
                onClick={onAddNew}
                className="p-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/30 transition-colors"
                aria-label={`Add new ${title.toLowerCase()}`}
                title={`Add new ${title.toLowerCase()}`}
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search bar - conditionally displayed */}
        {isSearchVisible && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-10 pr-4 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Section content with transition */}
      <div
        ref={contentRef}
        id={`section-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          height: isExpanded ? 'auto' : '0',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div className="px-4 py-3 text-sm border-t border-gray-100 dark:border-gray-700">
          {content && (
            <div className="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300">
              {content}
            </div>
          )}
          
          {filteredItems.length > 0 ? (
            <div className="space-y-3 pt-2">
              {filteredItems.map((item, index) => {
                const renderedItem = itemRenderer ? itemRenderer(item) : null;
                
                if (!renderedItem) return null;
                
                // Determine status color based on any status information
                let statusColor = "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white ";
                
                if (renderedItem.status === "critical" || renderedItem.status === "urgent") {
                  statusColor = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
                } else if (renderedItem.status === "warning" || renderedItem.status === "attention") {
                  statusColor = "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
                } else if (renderedItem.status === "complete" || renderedItem.status === "success") {
                  statusColor = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
                } else if (renderedItem.status === "upcoming" || renderedItem.status === "scheduled") {
                  statusColor = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
                }
                
                // Check if the item has an upcoming date (within 7 days)
                const isUpcoming = renderedItem.date && (
                  new Date(renderedItem.date) > new Date() && 
                  new Date(renderedItem.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                );
                
                return (
                  <div 
                    key={item.id || index} 
                    className={`p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border transition-all ${
                      renderedItem.status === "critical" 
                        ? "border-red-200 dark:border-red-800" 
                        : isUpcoming 
                          ? "border-blue-200 dark:border-blue-800" 
                          : "border-gray-100 dark:border-gray-700"
                    } hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center">
                          {renderedItem.icon && (
                            <span className="mr-2">{renderedItem.icon}</span>
                          )}
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            {renderedItem.title}
                            {renderedItem.subtitle && (
                              <span className="ml-1 text-sm font-normal text-gray-500 dark:text-white">
                                ({renderedItem.subtitle})
                              </span>
                            )}
                          </h4>
                          {isUpcoming && !renderedItem.status && (
                            <span className="ml-2">
                              <AlertCircle size={14} className="text-blue-500" />
                            </span>
                          )}
                        </div>
                        
                        {renderedItem.details && renderedItem.details.length > 0 && (
                          <dl className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                            {renderedItem.details.map((detail, idx) => (
                              <div key={idx} className="text-sm">
                                <dt className="inline text-gray-500 dark:text-gray-400 font-medium mr-1">{detail.label}:</dt>
                                <dd className="inline text-gray-700 dark:text-gray-300">{detail.value || "—"}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        
                        {renderedItem.description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-white-400">
                            {renderedItem.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4 flex-shrink-0">
                        {renderedItem.date && (
                          <div className={`flex items-center text-xs px-2 py-1 rounded ${statusColor}`}>
                            <Calendar size={12} className="mr-1" />
                            {renderedItem.date}
                          </div>
                        )}
                        
                        {renderedItem.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                            {renderedItem.statusText || renderedItem.status}
                          </span>
                        )}
                        
                        {renderedItem.action && (
                          <button 
                            onClick={renderedItem.action.onClick}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {renderedItem.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : searchQuery ? (
            <div className="py-4 text-center text-gray-500 dark:text-white-400">
              <p>No matches found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
              >
                Clear search
              </button>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-white-400 italic py-3 text-center">
              {emptyMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}