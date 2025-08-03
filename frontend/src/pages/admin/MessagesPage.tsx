import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import contactService, { IContactMessage } from '../../services/contactService';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<IContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMessageModal, setShowMessageModal] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (activeFilter === 'unread') {
        filters.read = false;
      } else if (activeFilter !== 'all') {
        filters.category = activeFilter;
      }
      
      const response = await contactService.getAllMessages(filters);
      setMessages(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please check the API connection.');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      await contactService.deleteMessage(messageToDelete);
      setMessages(messages.filter(msg => msg._id !== messageToDelete));
      setMessageToDelete(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getSelectedMessage = () => {
    return messages.find(msg => msg._id === showMessageModal);
  };

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Contact Messages</h1>
          <div className="text-white bg-dark-purple-light px-4 py-2 rounded-lg shadow-lg">
            <span className="text-neon-green font-semibold">{messages.filter(msg => !msg.read).length}</span> unread of <span>{messages.length}</span> total
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-cyan-400 text-dark-purple' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-cyan-400/40'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Messages
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'unread' 
                  ? 'bg-neon-green text-dark-purple' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-green/40'
              }`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'partnership' 
                  ? 'bg-neon-blue text-dark-purple' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-blue/40'
              }`}
              onClick={() => setActiveFilter('partnership')}
            >
              Partnership
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'support' 
                  ? 'bg-neon-pink text-dark-purple' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-pink/40'
              }`}
              onClick={() => setActiveFilter('support')}
            >
              Support
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'general' 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-purple/40'
              }`}
              onClick={() => setActiveFilter('general')}
            >
              General
            </button>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-dark-purple-light rounded-lg border border-neon-purple/20 overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-pink mx-auto mb-4"></div>
              <p className="text-gray-400">Loading messages...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-purple/20 bg-dark-purple">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neon-purple/20">
                  {messages.map((message, index) => (
                    <tr 
                      key={message._id} 
                      className={`transition-colors hover:bg-neon-purple/10 ${
                        index % 2 === 0 ? 'bg-dark-purple-light/70' : ''
                      } ${!message.read ? 'border-l-2 border-neon-green' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`w-3 h-3 rounded-full ${!message.read ? 'bg-neon-green shadow-md shadow-neon-green/30' : 'bg-gray-500'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">{message.name}</div>
                          <div className="text-xs text-gray-400">{message.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${!message.read ? 'font-bold text-white' : 'text-gray-300'}`}>
                          {message.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${
                          message.category.toLowerCase() === 'partnership' ? 'bg-neon-blue/20 text-neon-blue' :
                          message.category.toLowerCase() === 'support' ? 'bg-neon-pink/20 text-neon-pink' :
                          'bg-neon-purple/20 text-neon-purple'
                        }`}>
                          {contactService.getCategoryDisplayName(message.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{contactService.formatDate(message.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-cyan-400 hover:text-cyan-300 mr-3 transition-colors"
                          onClick={() => {
                            setShowMessageModal(message._id);
                            if (!message.read) markAsRead(message._id);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-400 transition-colors"
                          onClick={() => setMessageToDelete(message._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Message Detail Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-dark-purple border border-neon-purple/30 rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden"
            >
              {getSelectedMessage() && (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-dark-purple to-dark-purple-light px-8 py-6 border-b border-neon-purple/20">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-neon-pink mb-2">{getSelectedMessage()?.subject}</h2>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-300">From:</span>
                          <span className="text-white font-semibold">{getSelectedMessage()?.name}</span>
                          <span className="text-gray-400">({getSelectedMessage()?.email})</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowMessageModal(null)}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-dark-purple rounded-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="p-8 bg-dark-purple">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      {/* Left Column - Message Details */}
                      <div className="lg:col-span-2">
                        <div className="bg-dark-purple-light rounded-lg p-6 border border-neon-purple/20">
                          <h3 className="text-lg font-semibold text-neon-cyan mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Message Content
                          </h3>
                          <div className="bg-dark-purple rounded-lg p-4 border border-neon-purple/10">
                            <p className="text-white whitespace-pre-line leading-relaxed">{getSelectedMessage()?.message}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Message Info */}
                      <div className="space-y-6">
                        {/* Date & Time */}
                        <div className="bg-dark-purple-light rounded-lg p-4 border border-neon-purple/20">
                          <h4 className="text-sm font-semibold text-neon-cyan mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Received
                          </h4>
                          <p className="text-white font-medium">{contactService.formatDate(getSelectedMessage()?.createdAt || '')}</p>
                        </div>

                        {/* Category */}
                        <div className="bg-dark-purple-light rounded-lg p-4 border border-neon-purple/20">
                          <h4 className="text-sm font-semibold text-neon-cyan mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M7 19h.01M11 7h.01M11 11h.01M11 15h.01M11 19h.01M15 7h.01M15 11h.01M15 15h.01M15 19h.01M19 7h.01M19 11h.01M19 15h.01M19 19h.01" />
                            </svg>
                            Category
                          </h4>
                          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full shadow-sm ${
                            getSelectedMessage()?.category.toLowerCase() === 'partnership' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' :
                            getSelectedMessage()?.category.toLowerCase() === 'support' ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30' :
                            'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                          }`}>
                            {contactService.getCategoryDisplayName(getSelectedMessage()?.category || '')}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="bg-dark-purple-light rounded-lg p-4 border border-neon-purple/20">
                          <h4 className="text-sm font-semibold text-neon-cyan mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Status
                          </h4>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${!getSelectedMessage()?.read ? 'bg-neon-green shadow-md shadow-neon-green/30' : 'bg-gray-500'}`}></div>
                            <span className={`text-sm font-medium ${!getSelectedMessage()?.read ? 'text-neon-green' : 'text-gray-400'}`}>
                              {getSelectedMessage()?.read ? 'Read' : 'Unread'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neon-purple/20">
                      <button
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 font-semibold flex items-center justify-center"
                        onClick={() => window.open(`mailto:${getSelectedMessage()?.email}?subject=Re: ${getSelectedMessage()?.subject}`)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Reply via Email
                      </button>
                      <button
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center"
                        onClick={() => {
                          setMessageToDelete(getSelectedMessage()?._id || '');
                          setShowMessageModal(null);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Message
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {messageToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-md shadow-xl"
            >
              <h3 className="text-xl font-bold text-neon-pink mb-4">Delete Message</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-dark-purple text-white rounded-md hover:bg-dark-purple/70 transition-colors"
                  onClick={() => setMessageToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  onClick={handleDeleteMessage}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;