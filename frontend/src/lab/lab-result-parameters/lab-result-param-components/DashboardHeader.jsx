import React, { useEffect, useState } from "react";
import { 
  ClipboardList, Activity, Users, FileText, BarChart3, 
  PieChart, TrendingUp, Filter, Search, Download,
  Calendar, AlertTriangle, CheckCircle, XCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts';

// Header Component
export default function DashboardHeader  ({  parametersCount, 
  onGroupingChange, 
  groupBy, 
  onSearchChange, 
  searchTerm,
  showAnalytics,
  onToggleAnalytics,
  showCharts,
  onToggleCharts
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <ClipboardList className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Lab Results</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Detailed view of lab test result entries
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600 dark:text-slate-400">
              Total: <span className="font-semibold text-slate-900 dark:text-white">{parametersCount}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search lab results..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={groupBy}
              onChange={(e) => onGroupingChange(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">No Grouping</option>
              <option value="status">Group by Status</option>
              <option value="parameter">Group by Parameter</option>
              <option value="doctor">Group by Doctor</option>
              <option value="child">Group by Patient</option>
              <option value="lab_tech">Group by Lab Technician</option>
              <option value="age_group">Group by Age Group</option>
            </select>

            {/* Toggle Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAnalytics}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  showAnalytics 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <Activity className="w-4 h-4" />
                Analytics
              </button>
              
              <button
                onClick={onToggleCharts}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  showCharts 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Charts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


