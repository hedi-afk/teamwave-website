import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../../config';

interface Registration {
  _id: string;
  eventId: {
    _id: string;
    name: string;
    game: string;
    startDate: string;
  };
  name: string;
  email: string;
  phoneNumber: string;
  gameName: string;
  gameId?: string;
  team?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [events, setEvents] = useState<{id: string, name: string}[]>([]);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.apiUrl}/registrations`);
        setRegistrations(response.data);
        
        // Extract unique events from registrations
        const uniqueEvents = Array.from(
          new Set(response.data.map((reg: Registration) => reg.eventId?._id))
        ).map(eventId => {
          const event = response.data.find((reg: Registration) => reg.eventId?._id === eventId);
          return {
            id: eventId as string,
            name: event?.eventId?.name || 'Unknown Event'
          };
        });
        
        setEvents(uniqueEvents);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching registrations:', error);
        setError('Failed to load registrations. Please try again later.');
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    try {
      await axios.patch(`${config.apiUrl}/registrations/${registrationId}/status`, {
        status: newStatus
      });
      
      // Update local state
      setRegistrations(registrations.map(reg => 
        reg._id === registrationId ? { ...reg, status: newStatus as 'pending' | 'approved' | 'rejected' } : reg
      ));
      
      // If we're viewing the detail of this registration, update it
      if (currentRegistration && currentRegistration._id === registrationId) {
        setCurrentRegistration({
          ...currentRegistration,
          status: newStatus as 'pending' | 'approved' | 'rejected'
        });
      }
    } catch (error: any) {
      console.error('Error updating registration status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleShowDetail = (registration: Registration) => {
    setCurrentRegistration(registration);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-neon-blue text-dark-purple';
      case 'approved':
        return 'bg-neon-green text-dark-purple';
      case 'rejected':
        return 'bg-neon-red text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  // Filter registrations based on status and event
  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    const matchesEvent = filterEvent === 'all' || reg.eventId?._id === filterEvent;
    return matchesStatus && matchesEvent;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-pixel text-neon-blue mb-2">EVENT REGISTRATIONS</h1>
        <p className="text-gray-300">Manage player registrations for events</p>
      </div>

      {/* Filters */}
      <div className="bg-dark-purple/30 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-neon-purple text-white' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-purple/40'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                ALL
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-neon-blue text-black' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-blue/40'
                }`}
                onClick={() => setFilterStatus('pending')}
              >
                PENDING
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  filterStatus === 'approved' 
                    ? 'bg-neon-green text-black' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-green/40'
                }`}
                onClick={() => setFilterStatus('approved')}
              >
                APPROVED
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  filterStatus === 'rejected' 
                    ? 'bg-neon-red text-white' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-red/40'
                }`}
                onClick={() => setFilterStatus('rejected')}
              >
                REJECTED
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Filter by Event</label>
            <select
              className="w-full bg-dark-purple border-2 border-neon-purple px-3 py-1 rounded text-white focus:outline-none focus:border-neon-blue"
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-neon-purple animate-pulse">Loading registrations...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-neon-red/10 border border-neon-red text-neon-red p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Registration List */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 bg-dark-purple/20 rounded-lg">
              <p className="text-gray-300">No registrations found matching your criteria.</p>
            </div>
          ) : (
            <table className="w-full bg-dark-purple/20 rounded-lg overflow-hidden">
              <thead className="bg-dark-purple/50 text-neon-blue">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Event</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Registered On</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => (
                  <tr key={registration._id} className="border-t border-neon-purple/20 hover:bg-neon-purple/5">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{registration.name}</div>
                      <div className="text-xs text-gray-400">{registration.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{registration.eventId?.name || 'Unknown Event'}</div>
                      <div className="text-xs text-neon-green">{registration.eventId?.game}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(registration.status)}`}>
                        {registration.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {formatDate(registration.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleShowDetail(registration)}
                          className="bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue text-xs px-2 py-1 rounded transition-colors"
                        >
                          Details
                        </button>
                        {registration.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(registration._id, 'approved')}
                              className="bg-neon-green/20 hover:bg-neon-green/40 text-neon-green text-xs px-2 py-1 rounded transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleStatusChange(registration._id, 'rejected')}
                              className="bg-neon-red/20 hover:bg-neon-red/40 text-neon-red text-xs px-2 py-1 rounded transition-colors"
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
          )}
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
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-neon-pink"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-neon-green font-arcade mb-1">EVENT INFORMATION</h3>
                <p className="text-white text-lg">{currentRegistration.eventId?.name || 'Unknown Event'}</p>
                <p className="text-gray-400">Game: {currentRegistration.eventId?.game}</p>
                <p className="text-gray-400">Date: {formatDate(currentRegistration.eventId?.startDate || '')}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-neon-pink font-arcade mb-1">PLAYER INFORMATION</h3>
                
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
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(currentRegistration.status)}`}>
                        {currentRegistration.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {currentRegistration.message && (
                <div className="mb-6">
                  <h3 className="text-neon-blue font-arcade mb-1">ADDITIONAL INFORMATION</h3>
                  <p className="text-gray-300 bg-dark-purple/20 p-3 rounded">{currentRegistration.message}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                {currentRegistration.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => {
                        handleStatusChange(currentRegistration._id, 'approved');
                      }}
                      className="pixel-btn bg-neon-green text-retro-black"
                    >
                      APPROVE
                    </button>
                    <button 
                      onClick={() => {
                        handleStatusChange(currentRegistration._id, 'rejected');
                      }}
                      className="pixel-btn bg-neon-red text-white"
                    >
                      REJECT
                    </button>
                  </>
                )}
                <button 
                  onClick={handleCloseDetail}
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
  );
};

export default AdminRegistrationsPage; 