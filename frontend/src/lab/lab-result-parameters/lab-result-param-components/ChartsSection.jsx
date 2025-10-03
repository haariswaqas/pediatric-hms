import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { Calendar, BarChart3, Users, TrendingUp } from "lucide-react";

// Charts Component
export default function ChartsSection({ parameters }) {
  // Status distribution data
  const statusData = parameters.reduce((acc, param) => {
    const status = param.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(statusData).map(([status, count]) => ({
    name: status,
    value: count
  }));

  // Parameter distribution data
  const parameterData = parameters.reduce((acc, param) => {
    const paramName =
      param.reference_range_details?.parameter_name || "Unknown";
    acc[paramName] = (acc[paramName] || 0) + 1;
    return acc;
  }, {});

  const parameterChartData = Object.entries(parameterData)
    .slice(0, 10) // Show top 10
    .map(([parameter, count]) => ({
      name:
        parameter.length > 15
          ? parameter.substring(0, 15) + "..."
          : parameter,
      count
    }));

  // Age group distribution
  const ageGroupData = parameters.reduce((acc, param) => {
    const age = param.child_details?.age || 0;
    let group = "Unknown";
    if (age < 2) group = "0-2 years";
    else if (age < 6) group = "2-6 years";
    else if (age < 12) group = "6-12 years";
    else if (age < 18) group = "12-18 years";
    else group = "18+ years";

    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const ageGroupChartData = Object.entries(ageGroupData).map(
    ([group, count]) => ({
      name: group,
      value: count
    })
  );

  const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <RechartsPieChart className="w-5 h-5" />
          Status Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <RechartsPieChart>
            <Pie
              data={statusChartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {statusChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Parameters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Parameters Tested
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={parameterChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Age Group Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Age Group Distribution
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <RechartsPieChart>
            <Pie
              data={ageGroupChartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {ageGroupChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis Placeholder */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Monthly Test Trend
        </h3>
        <div className="h-[250px] flex items-center justify-center text-slate-500 dark:text-slate-400">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Trend data available with date information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
