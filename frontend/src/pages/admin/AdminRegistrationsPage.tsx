import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import registrationService, { IRegistration, RegistrationStats } from '../../services/registrationService';
import eventService from '../../services/eventService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

interface Event {
  _id: string;
  name: string;
  game: string;
  startDate: string;
}

const AdminRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<IRegistration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // UI states
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentRegistration, setCurrentRegistration] = useState<IRegistration | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{
    count: number;
    action: () => Promise<void>;
  } | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [currentPage, filterStatus, filterEvent, searchTerm, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch registrations with filters
      const response = await registrationService.getAllRegistrations();
      
      // Handle both paginated and non-paginated responses
      if (Array.isArray(response)) {
        setRegistrations(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else {
        setRegistrations(response.registrations);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || response.registrations.length);
      }

      // Fetch events for filter dropdown
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData);

      // Fetch statistics
      const statsData = await registrationService.getRegistrationStats();
      setStats(statsData);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await registrationService.updateRegistrationStatus(registrationId, newStatus);
      
      // Update local state
      setRegistrations(prev => prev.map(reg => 
        reg._id === registrationId ? { ...reg, status: newStatus } : reg
      ));
      
      setSuccess(`Registration status updated to ${newStatus}`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      const statsData = await registrationService.getRegistrationStats();
      setStats(statsData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleBulkStatusUpdate = async (status: 'pending' | 'approved' | 'rejected') => {
    if (selectedRegistrations.length === 0) return;
    
    try {
      await registrationService.bulkUpdateStatus(selectedRegistrations, status);
      
      // Update local state
      setRegistrations(prev => prev.map(reg => 
        selectedRegistrations.includes(reg._id) ? { ...reg, status } : reg
      ));
      
      setSelectedRegistrations([]);
      setShowBulkActions(false);
      setSuccess(`Updated ${selectedRegistrations.length} registrations to ${status}`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh stats
      const statsData = await registrationService.getRegistrationStats();
      setStats(statsData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to bulk update');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRegistrations.length === 0) return;
    
    setDeleteConfirmData({
      count: selectedRegistrations.length,
      action: async () => {
        try {
          await registrationService.bulkDeleteRegistrations(selectedRegistrations);
          
          // Remove from local state
          setRegistrations(prev => prev.filter(reg => !selectedRegistrations.includes(reg._id)));
          setSelectedRegistrations([]);
          setShowBulkActions(false);
          setSuccess(`Deleted ${selectedRegistrations.length} registrations`);
          setTimeout(() => setSuccess(null), 3000);
          
          // Refresh stats
          const statsData = await registrationService.getRegistrationStats();
          setStats(statsData);
          
        } catch (err: any) {
          setError(err.message || 'Failed to delete registrations');
          setTimeout(() => setError(null), 5000);
        }
      }
    });
    setShowDeleteConfirm(true);
  };

  const handleExportCSV = async () => {
    try {
      const csvContent = await registrationService.exportRegistrations(
        filterEvent !== 'all' ? filterEvent : undefined
      );
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Registrations exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export registrations');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSelectAll = () => {
    if (selectedRegistrations.length === registrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(registrations.map(reg => reg._id));
    }
  };

  const handleSelectRegistration = (registrationId: string) => {
    setSelectedRegistrations(prev => 
      prev.includes(registrationId) 
        ? prev.filter(id => id !== registrationId)
        : [...prev, registrationId]
    );
  };

  // Confirmation dialog handlers
  const handleConfirmDelete = async () => {
    if (deleteConfirmData) {
      await deleteConfirmData.action();
      setShowDeleteConfirm(false);
      setDeleteConfirmData(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmData(null);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'approved':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    const matchesEvent = filterEvent === 'all' || reg.eventId._id === filterEvent;
    const matchesSearch = !searchTerm || 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.team && reg.team.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesEvent && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-retro-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-pixel text-white mb-2">Tournament Registrations</h1>
            <p className="text-gray-400">Manage player registrations for tournaments and events</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="pixel-btn bg-neon-green text-black hover:bg-neon-green/80 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="pixel-btn bg-neon-blue text-white hover:bg-neon-blue/80 transition-colors"
            >
              {viewMode === 'list' ? 'Grid View' : 'List View'}
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              className="bg-dark-purple/30 border border-gray-700 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-pixel text-white mb-1">{stats.total}</div>
              <div className="text-gray-400 text-sm">Total Registrations</div>
            </motion.div>
            
            <motion.div
              className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-pixel text-yellow-400 mb-1">{stats.pending}</div>
              <div className="text-gray-400 text-sm">Pending Review</div>
            </motion.div>
            
            <motion.div
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-pixel text-green-400 mb-1">{stats.approved}</div>
              <div className="text-gray-400 text-sm">Approved</div>
            </motion.div>
            
            <motion.div
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-pixel text-red-400 mb-1">{stats.rejected}</div>
              <div className="text-gray-400 text-sm">Rejected</div>
            </motion.div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-dark-purple/30 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Event</label>
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.name}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="status-asc">Status A-Z</option>
                <option value="status-desc">Status Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedRegistrations.length > 0 && (
          <div className="bg-neon-blue/20 border border-neon-blue/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-neon-blue">
                {selectedRegistrations.length} registration(s) selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('approved')}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('rejected')}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                >
                  Reject All
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                >
                  Delete All
                </button>
                <button
                  onClick={() => setSelectedRegistrations([])}
                  className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded text-green-400">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-neon-purple text-xl font-pixel">LOADING REGISTRATIONS...</div>
          </div>
        )}

        {/* Registrations List/Grid */}
        {!loading && !error && (
          <div className="bg-dark-purple/30 rounded-lg p-6">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 text-lg">No registrations found matching your criteria.</p>
              </div>
            ) : viewMode === 'list' ? (
              // List View
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-purple/50 text-neon-blue">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedRegistrations.length === filteredRegistrations.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-600"
                        />
                      </th>
                      <th className="py-3 px-4 text-left">Player</th>
                      <th className="py-3 px-4 text-left">Event</th>
                      <th className="py-3 px-4 text-left">Game Info</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Registered</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((registration) => (
                      <tr key={registration._id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedRegistrations.includes(registration._id)}
                            onChange={() => handleSelectRegistration(registration._id)}
                            className="rounded border-gray-600"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{registration.name}</div>
                          <div className="text-xs text-gray-400">{registration.email}</div>
                          <div className="text-xs text-gray-400">{registration.phoneNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{registration.eventId.name}</div>
                          <div className="text-xs text-neon-green">{registration.eventId.game}</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(registration.eventId.startDate)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-white">{registration.gameName}</div>
                          {registration.gameId && (
                            <div className="text-xs text-gray-400">ID: {registration.gameId}</div>
                          )}
                          {registration.team && (
                            <div className="text-xs text-neon-pink">Team: {registration.team}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(registration.status)}`}>
                            {registration.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {formatDate(registration.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setCurrentRegistration(registration);
                                setShowDetailModal(true);
                              }}
                              className="px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded hover:bg-neon-blue/30"
                            >
                              View
                            </button>
                            {registration.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(registration._id, 'approved')}
                                  className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(registration._id, 'rejected')}
                                  className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegistrations.map((registration) => (
                  <motion.div
                    key={registration._id}
                    className="bg-dark-purple/20 border border-gray-700 rounded-lg p-4 hover:border-neon-blue/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="checkbox"
                        checked={selectedRegistrations.includes(registration._id)}
                        onChange={() => handleSelectRegistration(registration._id)}
                        className="rounded border-gray-600"
                      />
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(registration.status)}`}>
                        {registration.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="text-white font-medium">{registration.name}</h3>
                      <p className="text-gray-400 text-sm">{registration.email}</p>
                      <p className="text-gray-400 text-sm">{registration.phoneNumber}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-neon-green text-sm font-medium">{registration.eventId.name}</p>
                      <p className="text-gray-400 text-xs">{registration.eventId.game}</p>
                      <p className="text-gray-400 text-xs">{formatDate(registration.eventId.startDate)}</p>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-white text-sm">{registration.gameName}</p>
                      {registration.gameId && (
                        <p className="text-gray-400 text-xs">ID: {registration.gameId}</p>
                      )}
                      {registration.team && (
                        <p className="text-neon-pink text-xs">Team: {registration.team}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCurrentRegistration(registration);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 px-2 py-1 bg-neon-blue/20 text-neon-blue text-xs rounded hover:bg-neon-blue/30"
                      >
                        View Details
                      </button>
                      {registration.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(registration._id, 'approved')}
                          className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-dark-purple/50 text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="text-gray-300">
              Page {currentPage} of {totalPages} ({totalItems} total)
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-dark-purple/50 text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Registration Detail Modal */}
        {showDetailModal && currentRegistration && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-retro-black border-2 border-neon-purple rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-between items-center p-4 border-b border-neon-purple/30">
                <h2 className="text-xl font-pixel text-neon-blue">Registration Details</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-neon-pink"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-neon-green font-pixel mb-2">EVENT INFORMATION</h3>
                  <p className="text-white text-lg">{currentRegistration.eventId.name}</p>
                  <p className="text-gray-400">Game: {currentRegistration.eventId.game}</p>
                  <p className="text-gray-400">Date: {formatDate(currentRegistration.eventId.startDate)}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-neon-pink font-pixel mb-2">PLAYER INFORMATION</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Name:</p>
                      <p className="text-white">{currentRegistration.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Email:</p>
                      <p className="text-white">{currentRegistration.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Phone:</p>
                      <p className="text-white">{currentRegistration.phoneNumber}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">Registration Date:</p>
                      <p className="text-white">{formatDate(currentRegistration.createdAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-400 text-sm">In-Game Name:</p>
                      <p className="text-white">{currentRegistration.gameName}</p>
                    </div>
                    
                    {currentRegistration.gameId && (
                      <div>
                        <p className="text-gray-400 text-sm">Game ID:</p>
                        <p className="text-white">{currentRegistration.gameId}</p>
                      </div>
                    )}
                    
                    {currentRegistration.team && (
                      <div>
                        <p className="text-gray-400 text-sm">Team:</p>
                        <p className="text-white">{currentRegistration.team}</p>
                      </div>
                    )}
                    
                    <div className="md:col-span-2">
                      <p className="text-gray-400 text-sm">Status:</p>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(currentRegistration.status)}`}>
                          {currentRegistration.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentRegistration.message && (
                  <div className="mb-6">
                    <h3 className="text-neon-blue font-pixel mb-2">ADDITIONAL INFORMATION</h3>
                    <p className="text-gray-300 bg-dark-purple/20 p-3 rounded">{currentRegistration.message}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  {currentRegistration.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusChange(currentRegistration._id, 'approved');
                          setShowDetailModal(false);
                        }}
                        className="pixel-btn bg-neon-green text-retro-black"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(currentRegistration._id, 'rejected');
                          setShowDetailModal(false);
                        }}
                        className="pixel-btn bg-neon-red text-white"
                      >
                        REJECT
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="pixel-btn bg-gray-700 text-white"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showDeleteConfirm && deleteConfirmData && (
        <ConfirmDialog
          title="Delete Registrations"
          message={`Are you sure you want to delete ${deleteConfirmData.count} registration${deleteConfirmData.count > 1 ? 's' : ''}? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          type="danger"
        />
      )}
    </div>
  );
};

export default AdminRegistrationsPage; 