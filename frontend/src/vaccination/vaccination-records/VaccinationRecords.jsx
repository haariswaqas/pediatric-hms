// src/vaccination/vaccination-records/VaccinationRecords.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchVaccinationRecords,
  deleteVaccinationRecord,
  clearSelectedVaccinationRecord,
  clearVaccinationRecordError,
} from '../../store/vaccination/vaccinationRecordSlice';
import { isDoctor, isNurse, isAdmin } from '../../utils/roles';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Search, Filter, X, Plus, Edit2, Trash2,
  AlertTriangle, CheckCircle, Calendar, ArrowUp, ArrowDown, RefreshCw, 
  CalendarArrowDown,
  CalendarArrowDownIcon
} from 'lucide-react';
import { format } from 'date-fns';

const VaccinationRecords = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vaccinationRecords, loading, error } = useSelector(
    (state) => state.vaccinationRecord
  );
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('scheduled_date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedTab, setSelectedTab] = useState('dashboard');

  useEffect(() => {
    dispatch(fetchVaccinationRecords());
    return () => {
      dispatch(clearSelectedVaccinationRecord());
      dispatch(clearVaccinationRecordError());
    };
  }, [dispatch]);

  const canModify = (record) => {
    if (isAdmin(user)) return false;
    if (isDoctor(user) && record.administered_by_details?.doctor_id === user.user_id) return true;
    if (isNurse(user) && record.administered_by_details?.nurse_id === user.user_id) return true;
    return false;
  };

  const [showUpcomingDetails, setShowUpcomingDetails] = useState(false);

const upcomingRecords = vaccinationRecords.filter(record => {
  const today = new Date();
  const in30 = new Date();
  in30.setDate(today.getDate() + 30);
  const sched = new Date(record.scheduled_date);
  return record.status === 'SCHEDULED' && sched >= today && sched <= in30;
});

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this record?')) {
      dispatch(deleteVaccinationRecord(id)).then(() => dispatch(fetchVaccinationRecords()));
    }
  };

  const handleEdit = (record, e) => {
    e.stopPropagation();
    dispatch(clearSelectedVaccinationRecord());
    navigate(`/vaccines/vaccination-records/edit/${record.id}`);
  };

  const handleAdd = () => navigate('/vaccines/vaccination-records/add');

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const handleRowClick = (record) => navigate(`/vaccines/vaccination-records/view/${record.id}`);

  const filteredRecords = vaccinationRecords
    .filter(r => {
      const child = `${r.child_details?.first_name} ${r.child_details?.last_name}`.toLowerCase();
      const vac = r.vaccine_details?.name.toLowerCase();
      const adm = `${r.administered_by_details?.first_name||''} ${r.administered_by_details?.last_name||''}`.toLowerCase();
      const m = searchTerm.toLowerCase();
      return (child.includes(m)||vac.includes(m)||adm.includes(m)||r.batch_number?.toLowerCase().includes(m))
        && (filterStatus==='all'||r.status===filterStatus);
    })
    .sort((a,b) => {
      let cmp=0;
      switch(sortField){
        case 'child_name':
          cmp = `${a.child_details.last_name} ${a.child_details.first_name}`
            .localeCompare(`${b.child_details.last_name} ${b.child_details.first_name}`);
          break;
        case 'vaccine_name':
          cmp = a.vaccine_details.name.localeCompare(b.vaccine_details.name);
          break;
        case 'dose_number':
          cmp = a.dose_number - b.dose_number; break;
        case 'status':
          cmp = a.status.localeCompare(b.status); break;
        case 'scheduled_date':
          cmp = new Date(a.scheduled_date) - new Date(b.scheduled_date); break;
        case 'administered_date':
          cmp = (!a.administered_date?1:new Date(a.administered_date)) - (!b.administered_date?1:new Date(b.administered_date));
          break;
      }
      return sortDirection==='asc'?cmp:-cmp;
    });

  const prepareChartData = () => {
    const statusCounts = {}; vaccinationRecords.forEach(r => statusCounts[r.status]=(statusCounts[r.status]||0)+1);
    const statusData = Object.entries(statusCounts).map(([name,value])=>({name,value}));
    const vacCounts={}; vaccinationRecords.forEach(r=>vacCounts[r.vaccine_details?.name||'Unknown']=(vacCounts[r.vaccine_details?.name]||0)+1);
    const vaccineData = Object.entries(vacCounts).map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,7);
    const mon={}; vaccinationRecords.forEach(r=>{ if(r.administered_date){const d=new Date(r.administered_date);const m=`${d.getMonth()+1}/${d.getFullYear()}`;mon[m]=(mon[m]||0)+1;}});
    const months=Object.keys(mon).map(k=>({k,sv:new Date(k.split('/')[1],k.split('/')[0]-1)})).sort((a,b)=>a.sv-b.sv).slice(-6).map(x=>x.k);
    const trendsData = months.map(m=>({month:m,count:mon[m]}));
    const today=new Date(),th=new Date();th.setDate(today.getDate()+30);
    const upcomingVaccinations = vaccinationRecords.filter(r=>r.status==='SCHEDULED'&& new Date(r.scheduled_date)>=today && new Date(r.scheduled_date)<=th).length;
    return { statusData, vaccineData, trendsData, upcomingVaccinations };
  };

  const chartData = prepareChartData();
  const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#8884d8','#82ca9d'];

  const renderSortIcon = f => sortField===f ? (sortDirection==='asc'?<ArrowUp className="inline ml-1"/>:<ArrowDown className="inline ml-1"/>) : null;

  const StatusBadge = ({status})=>{
    const base="text-xs font-medium px-2 py-1 rounded flex items-center gap-1";
    if(status==='SCHEDULED') return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200`}><Calendar size={12}/> {status}</span>;
    if(status==='COMPLETED') return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200`}><CheckCircle size={12}/> {status}</span>;
    if(status==='MISSED') return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200`}><AlertTriangle size={12}/> {status}</span>;
    if(status==='EXEMPTED') return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200`}><RefreshCw size={12}/> {status}</span>;
    return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>{status}</span>;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Vaccination Records</h2>
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 text-sm font-medium rounded ${
              selectedTab==='dashboard'? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100'
            }`}
            onClick={()=>setSelectedTab('dashboard')}
          >Dashboard</button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded ${
              selectedTab==='list'? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100'
            }`}
            onClick={()=>setSelectedTab('list')}
          >Records List</button>
          <button
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleAdd}
          ><Plus size={16}/> Add Record</button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      {selectedTab==='dashboard' && !loading && (
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg shadow-sm">
            
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Total Records</h3>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">{vaccinationRecords.length}</span>
              <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full">
                <Calendar size={24} className="text-blue-700 dark:text-blue-300" />
              </div>
              
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Completed</h3>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                {vaccinationRecords.filter(r=>r.status==='COMPLETED').length}
              </span>
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full">
                <CheckCircle size={24} className="text-green-700 dark:text-green-300" />
              </div>
            </div>
            
          </div>
          <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Missed</h3>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold text-red-700 dark:text-red-300">
                {vaccinationRecords.filter(r=>r.status==='MISSED').length}
              </span>
              <div className="p-3 bg-red-400 dark:bg-red-800 rounded-full">
                <X size={24} className="text-red-800 dark:text-red-300" />
              </div>
            </div>
            
          </div>
          <div 
  className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg shadow-sm cursor-pointer"
  onClick={() => setShowUpcomingDetails(open => !open)}
>
    
  <h3 className="text-base font-medium text-gray-800 dark:text-white mb-1">

    Upcoming (30d)
  </h3>
  <div className="flex justify-between items-center">
    <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
      {upcomingRecords.length} 
    </span>
    <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
      <CalendarArrowDown size={30} className="text-yellow-700 dark:text-yellow-300" />
    </div>
  </div>

  {showUpcomingDetails && (
    <ul className="mt-3 max-h-40 overflow-y-auto">
      {upcomingRecords.map((r) => (
        <li
        key={r.id}
        className="py-1 text-sm text-gray-700 dark:text-gray-200 border-b last:border-b-0"
      >
        {r.child_details.first_name} {r.child_details.last_name} on{' '}
        <span className="font-medium">
          {format(new Date(r.scheduled_date), 'EEE, MMM d, yyyy')}
        </span>
      </li>
      
      ))}
      {upcomingRecords.length === 0 && (
        <li className="py-1 text-sm text-gray-600 dark:text-gray-400">
          No upcoming scheduled doses.
        </li>
      )}
    </ul>
  )}
</div>


          
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow col-span-1 lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData.statusData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {chartData.statusData.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip wrapperClassName="dark:text-white" />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.trendsData}>
                <XAxis dataKey="month" tick={{fill: '#4B5563'}} />
                <YAxis tick={{fill: '#4B5563'}} />
                <Tooltip wrapperClassName="dark:text-white" />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow col-span-1 lg:col-span-3">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Vaccine Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.vaccineData} layout="vertical">
                <XAxis type="number" tick={{fill: '#4B5563'}} />
                <YAxis dataKey="name" type="category" width={150} tick={{fill: '#4B5563'}} />
                <Tooltip wrapperClassName="dark:text-white" />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedTab==='list' && !loading && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                placeholder="Search..."
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500 dark:text-gray-400" />
              <select
                value={filterStatus}
                onChange={e=>setFilterStatus(e.target.value)}
                className="py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              >
                <option value="all">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="MISSED">Missed</option>
                <option value="EXEMPTED">Exempted</option>
              </select>
            </div>
          </div>

          {filteredRecords.length===0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-8 text-center rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">No records match.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {['child_name','vaccine_name','dose_number','status','scheduled_date','administered_date'].map(key=>(
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <button className="flex items-center" onClick={()=>handleSort(key)}>
                          {key.replace('_',' ')} {renderSortIcon(key)}
                        </button>
                      </th>
                    ))}
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map(record=>(
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={()=>handleRowClick(record)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {record.child_details.first_name} {record.child_details.last_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{record.vaccine_details.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{record.vaccine_details.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.dose_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={record.status}/></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{format(new Date(record.scheduled_date), 'MMM d, yyyy')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.administered_date?format(new Date(record.administered_date), 'MMM d, yyyy'):'Not yet'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {canModify(record)?<span className="font-medium text-blue-600 dark:text-blue-300">(You) {record.administered_by_details.first_name} {record.administered_by_details.last_name}</span>:`${record.administered_by_details.first_name} ${record.administered_by_details.last_name}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canModify(record)&&(
                          <div className="flex justify-end gap-2">
                            <button className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-300" onClick={e=>handleEdit(record,e)}><Edit2 size={18}/></button>
                            <button className="text-red-600 hover:text-red-900 dark:hover:text-red-300" onClick={e=>handleDelete(record.id,e)}><Trash2 size={18}/></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaccinationRecords;
