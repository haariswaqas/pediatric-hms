import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getConversations, 
  clearSession, 
  getConversationDetail,
  setActiveSession 
} from '../store/chatbot/chatbotSlice';
import { 
  Calendar, 
  MessageCircle, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Download,
  ArrowLeft
} from 'lucide-react';
import { LoadingSpinner, ErrorAlert, EmptyState } from './ChatUtils';

const ChatHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { allConversations, loading, error } = useSelector((state) => state.chatbot);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, oldest, alphabetical
  const [filterBy, setFilterBy] = useState('all'); // all, today, week, month
  const [selectedConversations, setSelectedConversations] = useState(new Set());

  useEffect(() => {
    if (user) {
      dispatch(getConversations());
    }
  }, [dispatch, user]);

  const filteredAndSortedConversations = React.useMemo(() => {
    let filtered = [...allConversations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.session_id.includes(searchTerm)
      );
    }

    // Apply date filter
    const now = new Date();
    if (filterBy !== 'all') {
      filtered = filtered.filter(conv => {
        const convDate = new Date(conv.updated_at);
        const diffTime = Math.abs(now - convDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filterBy) {
          case 'today':
            return diffDays <= 1;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at) - new Date(a.updated_at);
        case 'oldest':
          return new Date(a.updated_at) - new Date(b.updated_at);
        case 'alphabetical':
          return (a.title || a.session_id).localeCompare(b.title || b.session_id);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allConversations, searchTerm, sortBy, filterBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleViewConversation = (sessionId) => {
    dispatch(setActiveSession(sessionId));
    dispatch(getConversationDetail(sessionId));
    navigate(`/chatbot/conversations/${sessionId}`);
  };

  const handleDeleteConversation = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await dispatch(clearSession(sessionId)).unwrap();
        dispatch(getConversations()); // Refresh the list
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleSelectConversation = (sessionId) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedConversations(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedConversations.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedConversations.size} conversations?`)) {
      try {
        const deletePromises = Array.from(selectedConversations).map(sessionId =>
          dispatch(clearSession(sessionId)).unwrap()
        );
        await Promise.all(deletePromises);
        setSelectedConversations(new Set());
        dispatch(getConversations()); // Refresh the list
      } catch (err) {
        console.error('Bulk delete error:', err);
      }
    }
  };

  const handleExportConversations = () => {
    const conversationsToExport = selectedConversations.size > 0 
      ? allConversations.filter(conv => selectedConversations.has(conv.session_id))
      : filteredAndSortedConversations;

    const exportData = {
      exported_at: new Date().toISOString(),
      total_conversations: conversationsToExport.length,
      conversations: conversationsToExport
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_history_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-500">Please sign in to view your chat history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/chatbot')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Chat</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chat History</h1>
                <p className="text-gray-600 mt-1">
                  {allConversations.length} conversation{allConversations.length !== 1 ? 's' : ''} total
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {selectedConversations.size > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    {selectedConversations.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Selected</span>
                  </button>
                </>
              )}
              
              <button
                onClick={handleExportConversations}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12">
              <LoadingSpinner text="Loading chat history..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorAlert message={error} />
            </div>
          ) : filteredAndSortedConversations.length === 0 ? (
            <div className="p-12">
              {searchTerm || filterBy !== 'all' ? (
                <EmptyState
                  icon={Search}
                  title="No conversations found"
                  description="Try adjusting your search or filter criteria"
                  action={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  actionText="Clear Filters"
                />
              ) : (
                <EmptyState
                  icon={MessageCircle}
                  title="No conversations yet"
                  description="Start chatting to see your conversation history here"
                  action={() => navigate('/chatbot')}
                  actionText="Start Chatting"
                />
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAndSortedConversations.map((conversation) => (
                <div
                  key={conversation.session_id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedConversations.has(conversation.session_id)}
                        onChange={() => handleSelectConversation(conversation.session_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.title || `Conversation ${conversation.session_id.slice(-8)}`}
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {conversation.session_id.slice(-8)}
                          </span>
                        </div>

                        {conversation.last_message && (
                          <p className="text-sm text-gray-600 truncate">
                            <span className="font-medium capitalize">
                              {conversation.last_message.role}:
                            </span>{' '}
                            {conversation.last_message.content}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{formatDate(conversation.updated_at)}</span>
                          <span>•</span>
                          <span>{conversation.message_count || 0} messages</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewConversation(conversation.session_id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View conversation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteConversation(conversation.session_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;