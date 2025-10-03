// src/logging/SystemLogList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSystemLogs,
  deleteSystemLog
} from '../store/admin/systemLogSlice';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  RefreshCw,
  Trash2,
  Search,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';

export default function SystemLogList() {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((s) => s.systemLogs);

  // UI state
  const [filters, setFilters] = useState({
    level: '',
    user: '',
    search: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Load on mount
  useEffect(() => {
    dispatch(fetchSystemLogs());
  }, [dispatch]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const refreshLogs = () => dispatch(fetchSystemLogs());
  const clearFilters = () =>
    setFilters({ level: '', user: '', search: '', startDate: '', endDate: '' });

  const toggleSelect = (id) =>
    setSelectedLogs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Apply filters + sorting
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (filters.level && log.level !== filters.level) return false;
        if (filters.user && !log.user.includes(filters.user)) return false;
        if (
          filters.search &&
          !log.message.toLowerCase().includes(filters.search.toLowerCase())
        )
          return false;
        if (filters.startDate) {
          if (new Date(log.timestamp) < new Date(filters.startDate)) return false;
        }
        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (new Date(log.timestamp) > end) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'timestamp') {
          return sortConfig.direction === 'asc'
            ? new Date(a.timestamp) - new Date(b.timestamp)
            : new Date(b.timestamp) - new Date(a.timestamp);
        }
        if (sortConfig.key === 'level') {
          const priority = { ERROR: 3, WARNING: 2, INFO: 1 };
          return sortConfig.direction === 'asc'
            ? priority[a.level] - priority[b.level]
            : priority[b.level] - priority[a.level];
        }
        return 0;
      });
  }, [logs, filters, sortConfig]);

  // Unique users for dropdown
  const uniqueUsers = useMemo(
    () => [...new Set(logs.map((l) => l.user).filter(Boolean))],
    [logs]
  );

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectAll = () =>
    setSelectedLogs((prev) =>
      prev.length === filteredLogs.length ? [] : filteredLogs.map((l) => l.id)
    );

  const handleDeleteSelected = () => {
    if (!selectedLogs.length) return;
    if (window.confirm(`Delete ${selectedLogs.length} logs?`)) {
      selectedLogs.forEach((id) => dispatch(deleteSystemLog(id)));
      setSelectedLogs([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getLevelIcon = (level) => {
    if (level === 'ERROR') return <AlertCircle className="text-red-500" />;
    if (level === 'WARNING') return <AlertTriangle className="text-yellow-500" />;
    return <Info className="text-blue-500" />;
  };
  const getLevelStyle = (level) => {
    if (level === 'ERROR')
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (level === 'WARNING')
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  // Render loading / error / empty
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <RefreshCw className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded shadow">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-red-500" />
          <span className="font-medium text-red-800">Error: {error}</span>
        </div>
        <button
          onClick={refreshLogs}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!logs.length) {
    return (
      <div className="p-8 text-center">
        <Info size={32} className="mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">No system logs</p>
        <button
          onClick={refreshLogs}
          className="mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded"
        >
          Refresh
        </button>
      </div>
    );
  }

  // Main table
  return (
    <div className="overflow-hidden rounded-lg border shadow bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold dark:text-white">
          System Logs <span className="text-sm font-normal dark:text-white">({filteredLogs.length})</span>
        </h2>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <button
            onClick={refreshLogs}
            title="Refresh"
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-white"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowFilters((v) => !v)}
            title="Toggle Filters"
            className={`p-2 rounded ${
              showFilters
                ? 'bg-blue-100 dark:bg-blue-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-white'
            }`}
          >
            <Filter size={18} />
          </button>
          {selectedLogs.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              title="Delete Selected"
              className="p-2 rounded bg-red-100 hover:bg-red-200 dark:bg-red-900"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        {/* Search */}
        <div className="relative mt-2 md:mt-0">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            placeholder="Search messages…"
            className="pl-10 pr-8 py-2 border rounded w-full md:w-64 bg-white dark:bg-gray-700"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level */}
            <div>
              <label className="block mb-1 text-sm">Log Level</label>
              <select
                value={filters.level}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, level: e.target.value }))
                }
                className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              >
                <option value="">All</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
              </select>
            </div>
            {/* User */}
            <div>
              <label className="block mb-1 text-sm">User</label>
              <select
                value={filters.user}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, user: e.target.value }))
                }
                className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              >
                <option value="">All</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            {/* Dates */}
            <div>
              <label className="block mb-1 text-sm">From</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, startDate: e.target.value }))
                }
                className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">To</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, endDate: e.target.value }))
                }
                className="w-full p-2 border rounded bg-white dark:bg-gray-700"
              />
            </div>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 dark:text-white">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={
                    selectedLogs.length > 0 &&
                    selectedLogs.length === filteredLogs.length
                  }
                  onChange={selectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('level')}
              >
                <div className="flex items-center space-x-1 text-sm font-medium">
                  Level
                  {sortConfig.key === 'level' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    ))}
                </div>
              </th>
              <th className="px-4 py-2 text-sm font-medium">Message</th>
              <th className="px-4 py-2 text-sm font-medium">User</th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1 text-sm font-medium">
                  Timestamp
                  {sortConfig.key === 'timestamp' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    ))}
                </div>
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedLogs.map((log) => (
              <tr
                key={log.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  selectedLogs.includes(log.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedLogs.includes(log.id)}
                    onChange={() => toggleSelect(log.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  {getLevelIcon(log.level)}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getLevelStyle(
                      log.level
                    )}`}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm break-words">{log.message}</td>
                <td className="px-4 py-2 text-sm">{log.user || 'System'}</td>
                <td className="px-4 py-2 text-sm">
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.timestamp).toRelativeTime()}
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this log?')) {
                        dispatch(deleteSystemLog(log.id));
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600">
            Showing{' '}
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{' '}
            {filteredLogs.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === idx + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="ml-4 p-1 border rounded bg-white"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// Utility: relative time formatting
if (!Date.prototype.toRelativeTime) {
  // eslint-disable-next-line no-extend-native
  Date.prototype.toRelativeTime = function () {
    const now = new Date();
    const diff = now - this;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return 'just now';
    if (min < 60) return `${min} minute${min > 1 ? 's' : ''} ago`;
    if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
    if (day < 30) return `${day} day${day > 1 ? 's' : ''} ago`;
    return this.toLocaleDateString();
  };
}
