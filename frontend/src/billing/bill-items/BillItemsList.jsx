import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBillItems } from "../../store/billing/billItemSlice";
import { useParams, Link } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { 
  ChevronDown, 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  Package,
  FileText, DownloadIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Eye,
  Grid,
  List
} from "lucide-react";

import { fetchBillPdf } from "../../store/billing/billGenerationSlice"; 

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const BillItemsAnalytics = ({ items, groupBy }) => {
  const analytics = useMemo(() => {
    if (!items || items.length === 0) return null;

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
    const avgAmount = totalAmount / totalItems;

    // Group data for charts
    const groupedData = items.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) {
        acc[key] = { name: key, value: 0, count: 0, amount: 0 };
      }
      acc[key].value += parseFloat(item.amount || 0);
      acc[key].amount += parseFloat(item.amount || 0);
      acc[key].count += 1;
      return acc;
    }, {});

    const chartData = Object.values(groupedData);

    return {
      totalAmount,
      totalItems,
      totalQuantity,
      avgAmount,
      chartData
    };
  }, [items, groupBy]);

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Stats Cards */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Amount</p>
              <p className="text-3xl font-bold">${analytics.totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Items</p>
              <p className="text-3xl font-bold">{analytics.totalItems}</p>
            </div>
            <Package className="w-10 h-10 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Avg. Amount</p>
              <p className="text-3xl font-bold">${analytics.avgAmount.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Amount by {groupBy}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
              <XAxis dataKey="name" className="dark:text-gray-400" />
              <YAxis className="dark:text-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(17, 24, 39)', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2" />
            Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analytics.chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analytics.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, onFilterChange, groupBy, onGroupByChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const groupOptions = [
    { value: 'bill_number', label: 'Bill Number' },
    { value: 'child', label: 'Child' },

    { value: 'related_model', label: 'Related Model' },
    { value: 'description', label: 'Description' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => onGroupByChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {groupOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {isOpen && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Amount
            </label>
            <input
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Model
            </label>
            <input
              type="text"
              value={filters.relatedModel || ''}
              onChange={(e) => onFilterChange({ ...filters, relatedModel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Filter by model"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bill Number
            </label>
            <input
              type="text"
              value={filters.billNumber || ''}
              onChange={(e) => onFilterChange({ ...filters, billNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Filter by bill"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </span>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === number
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const BillItemsList = () => {
  const dispatch = useDispatch();
  const { billId } = useParams();

  const { items, loading, error } = useSelector((state) => state.billItem);
  const { user } = useSelector((state) => state.auth);
  const { billPdfs, loading: pdfLoading, error: pdfError } = useSelector(
    (state) => state.billGeneration
  );

  const [groupBy, setGroupBy] = useState('bill_number');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [filters, setFilters] = useState({
    search: '',
    minAmount: '',
    maxAmount: '',
    relatedModel: '',
    billNumber: ''
  });
  const [showConfirm, setShowConfirm] = useState(false);  // ✅ new
  const [selectedBillNumber, setSelectedBillNumber] = useState(null); // ✅ new

  const handleGenerateBillPdf = async (billNumber) => {
    const result = await dispatch(fetchBillPdf(billNumber));
    if (result.meta.requestStatus === "fulfilled") {
      const fileUrl = result.payload.fileUrl;
      window.open(fileUrl, "_blank"); // ✅ open PDF in new tab
    }
  };
  useEffect(() => {
    dispatch(fetchBillItems());
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    if (!items) return [];

    return items.filter(item => {
      const matchesSearch = !filters.search || 
        item.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.bill_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.related_model?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesAmount = 
        (!filters.minAmount || parseFloat(item.amount) >= parseFloat(filters.minAmount)) &&
        (!filters.maxAmount || parseFloat(item.amount) <= parseFloat(filters.maxAmount));

      const matchesModel = !filters.relatedModel || 
        item.related_model?.toLowerCase().includes(filters.relatedModel.toLowerCase());

      const matchesBill = !filters.billNumber || 
        item.bill_number?.toLowerCase().includes(filters.billNumber.toLowerCase());

      return matchesSearch && matchesAmount && matchesModel && matchesBill;
    });
  }, [items, filters]);

  const groupedItems = useMemo(() => {
    return filteredItems?.reduce((acc, item) => {
      const key = item[groupBy] || 'Unknown';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {}) || {};
  }, [filteredItems, groupBy]);

  const paginatedGroups = useMemo(() => {
    const groups = Object.entries(groupedItems);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    if (viewMode === 'table') {
      // For table view, paginate individual items
      const allItems = filteredItems.slice(startIndex, endIndex);
      return { 'All Items': allItems };
    } else {
      // For grid view, paginate groups
      const paginatedGroupEntries = groups.slice(startIndex, endIndex);
      return Object.fromEntries(paginatedGroupEntries);
    }
  }, [groupedItems, currentPage, itemsPerPage, viewMode, filteredItems]);

  const totalPages = Math.ceil(
    viewMode === 'table' 
      ? filteredItems.length / itemsPerPage
      : Object.keys(groupedItems).length / itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Billing Records Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive analysis and management of your bill items
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <Link
  to="/billing/payments"
  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
>
  <FileText className="w-4 h-4" />
  <span>View Payments</span>
</Link>
          </div>
        </div>

        {/* Analytics */}
        <BillItemsAnalytics items={filteredItems} groupBy={groupBy} />

        {/* Filters */}
        <FilterPanel 
          filters={filters} 
          onFilterChange={setFilters}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />

        {/* Content */}
        {Object.keys(paginatedGroups).length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="space-y-8">
                {Object.entries(paginatedGroups).map(([groupKey, groupItems]) => (
                  <div
                    key={groupKey}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Group Header */}
                    <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                          <FileText className="w-6 h-6 mr-3 text-blue-500" />
                          {groupBy.replace('_', ' ').toUpperCase()}: {groupKey}
                        </h2>
                        <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold">
                          {groupItems.length} items
                        </span>
                        <button
  onClick={() => {
    setSelectedBillNumber(groupKey);
    setShowConfirm(true);
  }}
  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
>
  <Download className="w-5 h-5 mr-2" />
  Download Bill
</button>


          {/* ✅ Confirmation Modal */}
  {showConfirm && selectedBillNumber && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-4">Confirm</h2>
        <p>Do you want to generate PDF for Bill #{selectedBillNumber}?</p>
        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              handleGenerateBillPdf(selectedBillNumber);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Yes, Generate
          </button>
        </div>
      </div>
    </div>
  )}
                      </div>
                    </div>
                    

                    {/* Items Grid */}
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                  {item.description}
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <Package className="w-4 h-4 mr-2" />
                                    Qty: {item.quantity}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    ${item.unit_price} per unit
                                  </div>
                                  {item.related_model && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                      <FileText className="w-4 h-4 mr-2" />
                                      {item.related_model}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                ${parseFloat(item.amount).toFixed(2)}
                              </div>
                              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Description</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Bill #</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Patient</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Unit Price</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Related Model</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {paginatedGroups['All Items']?.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.bill_number}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.child}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            ${item.unit_price}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ${parseFloat(item.amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {item.related_model}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              totalItems={viewMode === 'table' ? filteredItems.length : Object.keys(groupedItems).length}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              No Bill Items Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {Object.keys(groupedItems).length === 0 && items?.length > 0
                ? "No items match your current filters. Try adjusting your search criteria."
                : "There are no bill items to display at the moment."
              }
            </p>
            {Object.keys(groupedItems).length === 0 && items?.length > 0 && (
              <button
                onClick={() => setFilters({
                  search: '',
                  minAmount: '',
                  maxAmount: '',
                  relatedModel: '',
                  billNumber: ''
                })}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
      
    </div>
    
  );
};

export default BillItemsList;