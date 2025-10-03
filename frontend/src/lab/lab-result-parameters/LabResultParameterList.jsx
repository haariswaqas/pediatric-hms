import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLabResultParameters } from '../../store/lab/labResultParameterSlice';
import DashboardHeader from './lab-result-param-components/DashboardHeader';
import AnalyticsCards from './lab-result-param-components/AnalyticsCards';
import ChartsSection from './lab-result-param-components/ChartsSection';
import ParametersTable from './lab-result-param-components/ParametersTable';
import {ClipboardList} from 'lucide-react';

export default function LabResultParameterList() {
  const dispatch = useDispatch();
  const { parameters, loading, error } = useSelector((state) => state.labResultParameter);
  const [groupBy, setGroupBy] = useState('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    dispatch(fetchLabResultParameters());
  }, [dispatch]);

  // Filter parameters based on search term
  const filteredParameters = parameters.filter(param => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      param.child_details?.name?.toLowerCase().includes(searchLower) ||
      param.doctor_details?.name?.toLowerCase().includes(searchLower) ||
      param.reference_range_details?.parameter_name?.toLowerCase().includes(searchLower) ||
      param.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading lab results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">!</span>
            </div>
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400">Error Loading Data</h2>
          </div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader 
          parametersCount={filteredParameters.length}
          onGroupingChange={setGroupBy}
          groupBy={groupBy}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          showAnalytics={showAnalytics}
          onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
          showCharts={showCharts}
          onToggleCharts={() => setShowCharts(!showCharts)}
        />
        
        {filteredParameters.length > 0 && (
          <>
            {showAnalytics && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <AnalyticsCards parameters={filteredParameters} />
              </div>
            )}
            
            {showCharts && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <ChartsSection parameters={filteredParameters} />
              </div>
            )}
            
            <ParametersTable parameters={filteredParameters} groupBy={groupBy} />
          </>
        )}

        {!loading && filteredParameters.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {searchTerm ? 'No matching results found' : 'No lab result parameters found'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No entries have been recorded yet.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}