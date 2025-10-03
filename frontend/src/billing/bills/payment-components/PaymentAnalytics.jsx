// src/billing/payment-components/PaymentAnalytics.jsx
import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  CreditCard, Users, Activity, Target 
} from 'lucide-react';

// Revenue Trend Chart Component
export const RevenueTrendChart = ({ payments }) => {
  const trendData = useMemo(() => {
    const monthlyRevenue = {};
    
    payments
      .filter(p => p.status === 'completed')
      .forEach(payment => {
        const date = new Date(payment.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = {
            month: monthName,
            revenue: 0,
            count: 0,
            date: date
          };
        }
        
        monthlyRevenue[monthKey].revenue += parseFloat(payment.amount || 0);
        monthlyRevenue[monthKey].count += 1;
      });

    return Object.values(monthlyRevenue)
      .sort((a, b) => a.date - b.date)
      .slice(-12); // Last 12 months
  }, [payments]);

  const currentMonth = trendData[trendData.length - 1]?.revenue || 0;
  const previousMonth = trendData[trendData.length - 2]?.revenue || 0;
  const trend = currentMonth > previousMonth;
  const trendPercentage = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Monthly revenue over time</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ${currentMonth.toLocaleString()}
          </div>
          <div className={`flex items-center text-sm ${
            trend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {trendPercentage}% vs last month
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              stroke="#64748B"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Payment Method Distribution Chart
export const PaymentMethodChart = ({ payments }) => {
  const methodData = useMemo(() => {
    const methods = {};
    
    payments
      .filter(p => p.status === 'completed')
      .forEach(payment => {
        const method = payment.method || 'Unknown';
        if (!methods[method]) {
          methods[method] = { name: method, value: 0, count: 0 };
        }
        methods[method].value += parseFloat(payment.amount || 0);
        methods[method].count += 1;
      });

    return Object.values(methods);
  }, [payments]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
          <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment Methods</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Distribution by method</p>
        </div>
      </div>
      
      <div className="h-80 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={methodData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {methodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-1/2 pl-6">
          <div className="space-y-3">
            {methodData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    ${item.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.count} transactions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Status Overview
export const PaymentStatusChart = ({ payments }) => {
  const statusData = useMemo(() => {
    const statuses = {};
    
    payments.forEach(payment => {
      const status = payment.status || 'Unknown';
      if (!statuses[status]) {
        statuses[status] = { name: status, value: 0, amount: 0 };
      }
      statuses[status].value += 1;
      statuses[status].amount += parseFloat(payment.amount || 0);
    });

    return Object.values(statuses);
  }, [payments]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return '#8B5CF6';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
          <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payment Status</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Transaction status breakdown</p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" stroke="#64748B" fontSize={12} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748B" 
              fontSize={12}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
              formatter={(value, name) => [
                name === 'value' ? `${value} payments` : `$${value.toLocaleString()}`,
                name === 'value' ? 'Count' : 'Amount'
              ]}
            />
            <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const PaymentKPIs = ({ payments }) => {
    const [statusFilter, setStatusFilter] = useState("completed"); // "completed" | "pending"
  
    const kpis = useMemo(() => {
      const filtered = payments.filter(p => p.status === statusFilter);
  
      const totalRevenue = filtered.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const averageTransaction = filtered.length > 0 ? totalRevenue / filtered.length : 0;
  
      const today = new Date();
      const thisMonth = filtered.filter(p => {
        const paymentDate = new Date(p.created_at);
        return (
          !isNaN(paymentDate) &&
          paymentDate.getMonth() === today.getMonth() &&
          paymentDate.getFullYear() === today.getFullYear()
        );
      });
      const monthlyRevenue = thisMonth.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  
      const successRate =
        payments.length > 0 ? (filtered.length / payments.length) * 100 : 0;
  
      return {
        totalRevenue,
        averageTransaction,
        monthlyRevenue,
        successRate,
        totalTransactions: payments.length,
        filteredTransactions: filtered.length,
      };
    }, [payments, statusFilter]);
  
    const kpiCards = [
      {
        title: "Total Revenue",
        value: `$${kpis.totalRevenue.toLocaleString()}`,
        icon: DollarSign,
        color: "emerald",
        change: "+12.5%",
        changeType: "increase",
      },
      {
        title: "This Month",
        value: `$${kpis.monthlyRevenue.toLocaleString()}`,
        icon: Calendar,
        color: "blue",
        change: "+8.2%",
        changeType: "increase",
      },
      {
        title: "Avg Transaction",
        value: `$${kpis.averageTransaction.toLocaleString()}`,
        icon: Target,
        color: "purple",
        change: "+3.1%",
        changeType: "increase",
      },
      {
        title: "Success Rate",
        value: `${kpis.successRate.toFixed(1)}%`,
        icon: Activity,
        color: "orange",
        change: "-2.4%",
        changeType: "decrease",
      },
    ];
  
    return (
      <div>
        {/* Toggle Controls */}
        <div className="flex justify-end mb-4 space-x-2">
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === "completed"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Pending
          </button>
        </div>
  
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            const colorClasses = {
              emerald:
                "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
              blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
              purple:
                "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
              orange:
                "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
            };
  
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${colorClasses[kpi.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      kpi.changeType === "increase"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {kpi.change}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {kpi.value}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {kpi.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

// Daily Payment Activity
export const DailyActivityChart = ({ payments }) => {
  const dailyData = useMemo(() => {
    const last30Days = {};
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      last30Days[dateKey] = {
        date: dayName,
        transactions: 0,
        revenue: 0,
        fullDate: date
      };
    }
    
    // Populate with actual data
  // Populate with actual data
payments
.filter(p => p.status === 'completed' && p.created_at)
.forEach(payment => {
  const paymentDate = new Date(payment.created_at);

  if (!isNaN(paymentDate)) { // only process valid dates
    const dateKey = paymentDate.toISOString().split('T')[0];

    if (last30Days[dateKey]) {
      last30Days[dateKey].transactions += 1;
      last30Days[dateKey].revenue += parseFloat(payment.amount || 0);
    }
  }

  if (isNaN(paymentDate)) {
    console.warn("Invalid payment date:", payment.created_at, payment);
  }
});

    
    return Object.values(last30Days);
  }, [payments]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
          <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Activity</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Last 30 days transaction activity</p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748B"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              stroke="#64748B"
              fontSize={12}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748B"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
              formatter={(value, name) => [
                name === 'transactions' ? `${value} transactions` : `$${value.toLocaleString()}`,
                name === 'transactions' ? 'Transactions' : 'Revenue'
              ]}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="transactions" fill="#3B82F6" name="Transactions" />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: '#10B981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
export const PaymentAnalyticsDashboard = ({ payments, isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-8 mb-8">
      {/* KPIs */}
      <PaymentKPIs payments={payments} />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueTrendChart payments={payments} />
        <PaymentMethodChart payments={payments} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PaymentStatusChart payments={payments} />
        <DailyActivityChart payments={payments} />
      </div>
    </div>
  );
};