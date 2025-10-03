// src/components/GenericSearch.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search } from 'lucide-react';

/**
 * GenericSearch: reusable search component.
 * Props:
 * - action: Redux thunk action creator accepting searchTerm
 * - selector: function(state) returning { searchResults, loading }
 * - onSearchResults: callback(results)
 * - placeholder: input placeholder text
 * - className: additional input classes
 */
export default function GenericSearch({
  action,
  selector,
  onSearchResults,
  placeholder = 'Search...',
  className = ''
}) {
  const dispatch = useDispatch();
  const { searchResults, loading } = useSelector(selector);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      onSearchResults?.(null);
      return;
    }
    dispatch(action(query))
      .unwrap()
      .then(results => onSearchResults?.(results))
      .catch(err => console.error('Search error:', err));
  };

  const handleReset = () => {
    setSearchTerm('');
    onSearchResults?.(null);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className={`w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
            >
              Reset
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"/>
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
            </p>
          </div>
        )}

        {searchResults && searchResults.length === 0 && searchTerm && !loading && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-600 rounded">
            <p className="text-yellow-800 dark:text-yellow-100">
              No records found matching "<span className="font-semibold">{searchTerm}</span>"
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
