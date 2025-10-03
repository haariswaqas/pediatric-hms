import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReports,
  downloadReport,
  deleteReportById,
  clearError,
  resetDownloadStatus
} from '../store/report/reportSlice';
import { useSnackbar } from 'notistack';
import ReportTypeFilter from './components/ReportTypeFilter';
import ReportCard from './components/ReportCard';
import ReportStats from './components/ReportStats';
import ReportTable from './components/ReportTable';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import { BarChart2, List } from 'lucide-react';
import formatTimeAgo from './components/formatTimeAgo';

export default function ReportList() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');

  // Extract state from Redux
  const { reports, loading: isLoading, error, downloadStatus } = useSelector((state) => state.report);
  const currentUser = useSelector((state) => state.auth.user); // Assuming user info is stored here

  // Fetch reports on component mount
  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // Reset error status when component unmounts
  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearError());
    }
  }, [error, enqueueSnackbar, dispatch]);

  // Handle download status changes
  useEffect(() => {
    if (downloadStatus === 'success') {
      enqueueSnackbar('Report downloaded successfully', { variant: 'success' });
      dispatch(resetDownloadStatus());
    } else if (downloadStatus === 'error') {
      enqueueSnackbar('Failed to download report', { variant: 'error' });
      dispatch(resetDownloadStatus());
    }
  }, [downloadStatus, enqueueSnackbar, dispatch]);

  const handleDownload = (downloadUrl) => {
    dispatch(downloadReport({ downloadUrl }));
  };

  const handleDelete = (id) => {
    dispatch(deleteReportById(id))
      .unwrap()
      .then(() => enqueueSnackbar('Report deleted', { variant: 'info' }))
      .catch(err => enqueueSnackbar(err, { variant: 'error' }));
  };

  // Filter reports belonging to the current user
  const userReports = reports?.filter(report => report.user === currentUser?.id) || [];

  // Further filter based on selected type
  const filteredReports = filterType === 'all'
    ? userReports
    : userReports.filter(report => report.report_type === filterType);

  // Get unique report types from user's reports
  const reportTypes = [...new Set(userReports.map(report => report.report_type))];

  if (isLoading) return <LoadingSpinner />;
  if (!userReports.length) return <EmptyState />;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
            Reports Dashboard
          </h1>

          <div className="flex space-x-4">
            {/* View toggle buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg flex p-1 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md flex items-center ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <BarChart2 size={16} className="mr-1" />
                <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md flex items-center ${
                  viewMode === 'table'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <List size={16} className="mr-1" />
                <span className="text-sm">Table</span>
              </button>
            </div>

            {/* Report type filter */}
            <ReportTypeFilter
              types={reportTypes}
              activeFilter={filterType}
              onFilterChange={setFilterType}
            />
          </div>
        </div>

        {/* Stats overview */}
        <ReportStats reports={userReports} />

        {/* Reports content */}
        <div className="mt-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  formatTimeAgo={formatTimeAgo}
                  onDownload={() => handleDownload(report.download_url)}
                  onDelete={() => handleDelete(report.id)}
                />
              ))}
            </div>
          ) : (
            <ReportTable
              reports={filteredReports}
              formatTimeAgo={formatTimeAgo}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
