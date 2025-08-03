import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import eventService, { IEvent } from '../../services/eventService';
import { format } from 'date-fns';
import config from '../../config';
import ImageUpload from '../../components/ui/ImageUpload';
import uploadService from '../../services/uploadService';

// Interface for form data (more simplified than the full IEvent to make the form easier)
interface EventFormData {
  name: string;
  description: string;
  image: string;
  game: string;
  location: string;
  startDate: string;
  endDate: string;
  prizePool: string;
  format: string;
  registrationDeadline: string;
  isPublic: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// Function to generate image URL (external or internal)
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return 'https://placehold.co/800x400/1A0033/00FFFF?text=NO+IMAGE';
  
  // Use the central uploadService for consistent URL generation
  return uploadService.getImageUrl(imagePath);
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Form state for adding/editing events
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    image: '',
    game: 'CS:GO',
    location: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd'),
    prizePool: '0',
    format: 'Elimination',
    registrationDeadline: format(new Date(), 'yyyy-MM-dd'),
    isPublic: true,
    status: 'upcoming'
  });

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAllEvents();
        setEvents(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission for adding new event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const eventData: IEvent = {
        name: formData.name,
        description: formData.description,
        image: formData.image || `https://placehold.co/800x400/1A0033/00FFFF?text=${encodeURIComponent(formData.name)}`,
        game: formData.game,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        status: formData.status,
        teams: [],
        prizePool: parseFloat(formData.prizePool) || 0,
        format: formData.format,
        registrationDeadline: formData.registrationDeadline,
        isPublic: formData.isPublic
      };
      
      console.log('Creating event with image:', formData.image);
      const newEvent = await eventService.createEvent(eventData);
      
      // Update local state
      setEvents([...events, newEvent]);
      
      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      
      // Show success message
      setSuccess(`Event "${formData.name}" was successfully created`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh events list after a short delay
      setTimeout(async () => {
        try {
          const refreshedEvents = await eventService.getAllEvents();
          setEvents(refreshedEvents);
        } catch (err) {
          console.error('Error refreshing events:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for editing event
  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEvent?._id) return;
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const eventData: Partial<IEvent> = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        game: formData.game,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        status: formData.status,
        prizePool: parseFloat(formData.prizePool) || 0,
        format: formData.format,
        registrationDeadline: formData.registrationDeadline,
        isPublic: formData.isPublic
      };
      
      console.log('Updating event with image:', formData.image);
      const updatedEvent = await eventService.updateEvent(currentEvent._id, eventData);
      
      // Update local state
      setEvents(events.map(event => event._id === currentEvent._id ? updatedEvent : event));
      
      // Reset form and close modal
      resetForm();
      setShowEditModal(false);
      
      // Show success message
      setSuccess(`Event "${formData.name}" was successfully updated`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh events list after a short delay
      setTimeout(async () => {
        try {
          const refreshedEvents = await eventService.getAllEvents();
          setEvents(refreshedEvents);
        } catch (err) {
          console.error('Error refreshing events:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
      console.error('Error updating event:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an event
  const confirmDeleteEvent = (id: string, name: string) => {
    setEventToDelete({ id, name });
    setShowDeleteModal(true);
  };
  
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      setLoading(true);
      
      await eventService.deleteEvent(eventToDelete.id);
      
      // Update local state
      setEvents(events.filter(event => event._id !== eventToDelete.id));
      
      // Show temporary success message
      setError(null);
      const successMessage = `Event "${eventToDelete.name}" has been successfully deleted`;
      setSuccess(successMessage);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Close modal
      setShowDeleteModal(false);
      setEventToDelete(null);
      
      // Refresh events list after a short delay
      setTimeout(async () => {
        try {
          const refreshedEvents = await eventService.getAllEvents();
          setEvents(refreshedEvents);
        } catch (err) {
          console.error('Error refreshing events:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      console.error('Error deleting event:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  // Initialize edit form with event data
  const initEditForm = (event: IEvent) => {
    setCurrentEvent(event);
    
    setFormData({
      name: event.name,
      description: event.description,
      image: event.image,
      game: event.game,
      location: event.location,
      startDate: typeof event.startDate === 'string' 
        ? event.startDate.split('T')[0] 
        : format(new Date(event.startDate), 'yyyy-MM-dd'),
      endDate: typeof event.endDate === 'string' 
        ? event.endDate.split('T')[0] 
        : format(new Date(event.endDate), 'yyyy-MM-dd'),
      prizePool: event.prizePool.toString(),
      format: event.format,
      registrationDeadline: typeof event.registrationDeadline === 'string' 
        ? event.registrationDeadline.split('T')[0] 
        : format(new Date(event.registrationDeadline), 'yyyy-MM-dd'),
      isPublic: event.isPublic,
      status: event.status
    });
    
    setShowEditModal(true);
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      game: 'CS:GO',
      location: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd'),
      prizePool: '0',
      format: 'Elimination',
      registrationDeadline: format(new Date(), 'yyyy-MM-dd'),
      isPublic: true,
      status: 'upcoming'
    });
    setCurrentEvent(null);
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'ongoing':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Handle toggling a single event selection
  const toggleEventSelection = (id: string) => {
    setSelectedEvents(prev => 
      prev.includes(id) 
        ? prev.filter(eventId => eventId !== id) 
        : [...prev, id]
    );
  };

  // Handle toggling all events selection
  const toggleAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event._id!));
    }
  };

  // Handle bulk delete of selected events
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      
      // Delete each selected event
      for (const eventId of selectedEvents) {
        await eventService.deleteEvent(eventId);
      }
      
      // Update local state
      setEvents(events.filter(event => !selectedEvents.includes(event._id!)));
      
      // Show success message
      const successMessage = `${selectedEvents.length} events have been successfully deleted`;
      setSuccess(successMessage);
      
      // Clear selected events
      setSelectedEvents([]);
      
      // Close modal
      setShowBulkDeleteModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Refresh events list after a short delay
      setTimeout(async () => {
        try {
          const refreshedEvents = await eventService.getAllEvents();
          setEvents(refreshedEvents);
        } catch (err) {
          console.error('Error refreshing events:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete events');
      console.error('Error deleting events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Events Management</h1>
          <div className="flex space-x-3">
            {selectedEvents.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Selected ({selectedEvents.length})
              </button>
            )}
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-neon-pink text-white px-4 py-2 rounded-md hover:bg-neon-pink/90 transition-colors"
            >
              Add New Event
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-white p-4 rounded-md mb-4">
            <p>{success}</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && !showAddModal && !showEditModal && !showDeleteModal && !showBulkDeleteModal && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
          </div>
        )}

        {/* Events table */}
        {!loading && events.length === 0 ? (
          <div className="bg-dark-purple-light rounded-lg border border-neon-pink/20 p-8 text-center">
            <p className="text-white">No events found. Create your first event!</p>
          </div>
        ) : (
        <div className="bg-dark-purple-light rounded-lg border border-neon-pink/20 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-pink/20 bg-dark-purple/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-neon-pink focus:ring-neon-pink/30 border-gray-700 rounded"
                        checked={selectedEvents.length === events.length && events.length > 0}
                        onChange={toggleAllEvents}
                      />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Event</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Game</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Location</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Prize</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon-pink/20">
                {events.map((event, index) => (
                  <tr 
                    key={event._id} 
                    className={`hover:bg-neon-pink/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-dark-purple/30' : 'bg-dark-purple/20'}`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-neon-pink focus:ring-neon-pink/30 border-gray-700 rounded"
                        checked={selectedEvents.includes(event._id!)}
                        onChange={() => toggleEventSelection(event._id!)}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-white">{event.name}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="w-10 h-8 overflow-hidden rounded-md shadow-lg">
                        <img 
                          src={getImageUrl(event.image)}
                          alt={event.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/800x400/1A0033/${event.game === 'CS:GO' ? 'FFFFFF' : (event.game === 'Valorant' ? 'FF00FF' : '00FF00')}?text=${event.game}`;
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-white">{event.game}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-white">{formatDate(event.startDate)}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-white">{event.location}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)} text-white shadow-md`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-white">${event.prizePool.toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-neon-pink hover:text-neon-pink/80 transition-colors duration-200"
                          onClick={() => initEditForm(event)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-400 transition-colors duration-200"
                          onClick={() => confirmDeleteEvent(event._id!, event.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-neon-pink">Add New Event</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <form className="space-y-5" onSubmit={handleAddEvent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Event Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Game *</label>
                    <select 
                      name="game"
                      value={formData.game}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    >
                      <option value="CS:GO">CS:GO</option>
                      <option value="Valorant">Valorant</option>
                      <option value="League of Legends">League of Legends</option>
                      <option value="Dota 2">Dota 2</option>
                      <option value="Fortnite">Fortnite</option>
                      <option value="Rocket League">Rocket League</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Event Image</label>
                  <ImageUpload
                    initialImage={formData.image}
                    onImageUpload={(imagePath) => {
                      setFormData({
                        ...formData,
                        image: imagePath
                      });
                    }}
                    placeholderText="Event Image"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Registration Deadline *</label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Prize Pool ($) *</label>
                    <input
                      type="number"
                      name="prizePool"
                      value={formData.prizePool}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Format *</label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    >
                      <option value="Elimination">Elimination</option>
                      <option value="Double Elimination">Double Elimination</option>
                      <option value="Round Robin">Round Robin</option>
                      <option value="Swiss">Swiss System</option>
                      <option value="League">League Format</option>
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      required
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                  </select>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-dark-purple rounded border border-gray-700">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="h-4 w-4 text-neon-pink focus:ring-neon-pink/30 border-gray-700 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-gray-300">
                    Make this event public
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2 bg-transparent border border-gray-700 text-white hover:bg-gray-800 transition-colors rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neon-pink text-white rounded hover:bg-neon-pink/90 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Event Modal */}
        {showEditModal && currentEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-neon-blue">Edit Event</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <form className="space-y-5" onSubmit={handleEditEvent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Event Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Game *</label>
                    <select 
                      name="game"
                      value={formData.game}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    >
                      <option value="CS:GO">CS:GO</option>
                      <option value="Valorant">Valorant</option>
                      <option value="League of Legends">League of Legends</option>
                      <option value="Dota 2">Dota 2</option>
                      <option value="Fortnite">Fortnite</option>
                      <option value="Rocket League">Rocket League</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Event Image</label>
                  <ImageUpload
                    initialImage={formData.image}
                    onImageUpload={(imagePath) => {
                      setFormData({
                        ...formData,
                        image: imagePath
                      });
                    }}
                    placeholderText="Event Image"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Registration Deadline *</label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Prize Pool ($) *</label>
                    <input
                      type="number"
                      name="prizePool"
                      value={formData.prizePool}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Format *</label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    >
                      <option value="Elimination">Elimination</option>
                      <option value="Double Elimination">Double Elimination</option>
                      <option value="Round Robin">Round Robin</option>
                      <option value="Swiss">Swiss System</option>
                      <option value="League">League Format</option>
                  </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      required
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                  </select>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-dark-purple rounded border border-gray-700">
                  <input
                    type="checkbox"
                    id="isPublicEdit"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="h-4 w-4 text-neon-blue focus:ring-neon-blue/30 border-gray-700 rounded"
                  />
                  <label htmlFor="isPublicEdit" className="ml-2 block text-gray-300">
                    Make this event public
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2 bg-transparent border border-gray-700 text-white hover:bg-gray-800 transition-colors rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-neon-blue text-white rounded hover:bg-neon-blue/90 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && eventToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-red-500">Delete Event</h2>
                <button
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="bg-dark-purple p-4 rounded border border-gray-700 mb-6">
                <p className="text-white text-lg font-bold mb-2">
                  "{eventToDelete.name}"
                </p>
                <p className="text-gray-300">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-5 py-2 bg-transparent border border-gray-700 text-white hover:bg-gray-800 transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-red-500">Bulk Delete Events</h2>
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="bg-dark-purple p-4 rounded border border-gray-700 mb-6">
                <p className="text-white text-lg font-bold mb-2">
                  Delete {selectedEvents.length} events
                </p>
                <p className="text-gray-300">
                  Are you sure you want to delete these {selectedEvents.length} events? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-5 py-2 bg-transparent border border-gray-700 text-white hover:bg-gray-800 transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : `Delete ${selectedEvents.length} Events`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 