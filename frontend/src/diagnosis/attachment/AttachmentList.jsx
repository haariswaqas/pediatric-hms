import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAttachments } from '../../store/diagnosis/attachmentSlice';
import {
  Search,
  Download,
  FileText,
  Image,
  File,
  MoreVertical,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { isDoctor, isLabTech } from '../../utils/roles';

const AttachmentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { attachments, loading, error } = useSelector((state) => state.attachment);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('uploaded_at');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    dispatch(fetchAttachments());
  }, [dispatch]);

  const filteredAttachments = attachments.filter(attachment => {
    const matchesSearch = 
      attachment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attachment.diagnosis_details?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attachment.uploaded_by_details?.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const sortedAttachments = [...filteredAttachments].sort((a, b) => {
    let cmp = 0;
    switch(sortField) {
      case 'uploaded_at':
        cmp = new Date(b.uploaded_at) - new Date(a.uploaded_at);
        break;
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'diagnosis':
        cmp = (a.diagnosis_details?.title || '').localeCompare(b.diagnosis_details?.title || '');
        break;
      case 'uploaded_by':
        cmp = (a.uploaded_by_details?.username || '').localeCompare(b.uploaded_by_details?.username || '');
        break;
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const handleAddAttachment = () => {
    navigate(`/diagnosis/attachments/add`);
  };

  const handleEditAttachment = (attachmentId) => {
    navigate(`/diagnosis/attachments/edit/${attachmentId}`);
  };

  const handleDownload = (fileUrl, fileName) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File className="w-5 h-5" />;
    
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (['pdf'].includes(ext)) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FileText className="w-5 h-5 text-green-600" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const userCanEdit = (attachment) => {
    // Allow edit if user is the uploader or has admin/doctor role
    return (
      user.role === 'admin' || 
      user.role === 'doctor' || 
      (user.role === 'lab_tech' && attachment.uploaded_by === user.id)
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attachments
          </h2>
          {(isDoctor(user) || isLabTech(user)) && (
            <button
              onClick={handleAddAttachment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Attachment
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search attachments by title, diagnosis, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                File
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'title') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('title');
                    setSortDirection('asc');
                  }
                }}
              >
                Title
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'diagnosis') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('diagnosis');
                    setSortDirection('asc');
                  }
                }}
              >
                Diagnosis
                {sortField === 'diagnosis' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'uploaded_by') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('uploaded_by');
                    setSortDirection('asc');
                  }
                }}
              >
                Uploaded By
                {sortField === 'uploaded_by' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => {
                  if (sortField === 'uploaded_at') {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('uploaded_at');
                    setSortDirection('asc');
                  }
                }}
              >
                Uploaded At
                {sortField === 'uploaded_at' && (
                  sortDirection === 'asc' ? <SortAsc className="w-4 h-4 inline" /> : <SortDesc className="w-4 h-4 inline" />
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : sortedAttachments.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No attachments found
                </td>
              </tr>
            ) : (
              sortedAttachments.map((attachment) => (
                <tr key={attachment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getFileIcon(attachment.file_name)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attachment.title}
                    </div>
                    {attachment.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {attachment.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {attachment.diagnosis_details?.title || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {attachment.diagnosis_details?.child_details?.first_name} {attachment.diagnosis_details?.child_details?.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {attachment.uploaded_by_details?.username || 'System'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {attachment.uploaded_by_details?.role}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(attachment.uploaded_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(attachment.file, attachment.file_name || 'download')}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      {userCanEdit(attachment) && (
                        <button
                          onClick={() => handleEditAttachment(attachment.id)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttachmentList;