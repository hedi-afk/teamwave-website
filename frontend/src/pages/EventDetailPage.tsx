import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import config from '../config';

import RegistrationForm from '../components/RegistrationForm';
import { format } from 'date-fns';
import uploadService from '../services/uploadService';

interface Event {
  _id: string;
  name: string;
  description: string;
  location: string;
  game: string;
  startDate: string;
  endDate: string;
  image: string;
  status: string;
  participants?: string[];
  prize?: string;
  registration_link?: string;
}

// Function to generate image URL (external or internal)
const getImageUrl = (imagePath: string, game?: string): string => {
  if (!imagePath) return `https://placehold.co/600x400/1A0033/00FFFF?text=${game || 'NO+IMAGE'}`;
  
  // Use the central uploadService for consistent URL generation
  return uploadService.getImageUrl(imagePath);
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Try to get data from API
        const response = await axios.get(`${config.apiUrl}/events/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching from API:', error);
        
        // If API fails, show error
        setError('Failed to load event. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRegistrationClick = () => {
    setShowRegistrationForm(true);
  };

  const handleRegistrationClose = () => {
    setShowRegistrationForm(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-neon-purple text-center">
          <div className="text-4xl font-pixel mb-4">LOADING</div>
          <div className="animate-pulse">...</div>
        </div>
      </motion.div>
    );
  }

  if (error || !event) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center p-4"
      >
        <h1 className="text-3xl font-pixel text-neon-red mb-4">ERROR</h1>
        <p className="text-gray-300 mb-6">{error || 'Event not found'}</p>
        <Link 
          to="/events" 
          className="pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple"
        >
          BACK TO EVENTS
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4">

        
        <div className="mb-8">
          <Link 
            to="/events" 
            className="inline-block text-neon-blue hover:text-neon-pink font-arcade transition-colors"
          >
            ← BACK TO EVENTS
          </Link>
        </div>

        <AnimatePresence>
          {showRegistrationForm && (
            <motion.div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
                <RegistrationForm
                  eventId={event._id}
                  eventName={event.name}
                  game={event.game}
                  onSuccess={handleRegistrationSuccess}
                  onCancel={handleRegistrationClose}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Event Image */}
          <div className="lg:col-span-1">
            <motion.div 
              className="arcade-card overflow-hidden"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden">
                <img 
                  src={getImageUrl(event.image, event.game)} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/600x400/1A0033/00FFFF?text=${event.game}`;
                  }}
                />
              </div>
              
              <div className="p-3 sm:p-4">
                <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                  <span className="bg-neon-green text-dark-purple text-xs font-bold px-2 py-1 rounded">
                    {event.game}
                  </span>
                  <span className="bg-neon-pink text-dark-purple text-xs font-bold px-2 py-1 rounded uppercase">
                    {event.status}
                  </span>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-300">
                  <div className="mb-1">
                    <span className="text-neon-blue">Start:</span> {formatDate(event.startDate)}
                  </div>
                  {event.endDate && (
                    <div>
                      <span className="text-neon-blue">End:</span> {formatDate(event.endDate)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {event.status === 'upcoming' && (
              <motion.div 
                className="mt-4 sm:mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button 
                  onClick={handleRegistrationClick}
                  className="pixel-btn bg-neon-green text-retro-black w-full text-center block text-sm sm:text-base px-4 py-3"
                >
                  REGISTER NOW
                </button>
              </motion.div>
            )}
            
            {event.registration_link && (
              <motion.div 
                className="mt-2 sm:mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <a 
                  href={event.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pixel-btn bg-neon-blue text-white w-full text-center block text-sm sm:text-base px-4 py-3"
                >
                  OFFICIAL TOURNAMENT PAGE
                </a>
              </motion.div>
            )}
          </div>
          
          {/* Event Details */}
          <motion.div 
            className="lg:col-span-2 arcade-card p-4 sm:p-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-pixel text-neon-blue mb-4">{event.name}</h1>
            
            {event.location && (
              <div className="mb-4 sm:mb-6 flex items-center">
                <span className="text-neon-pink mr-2">📍</span>
                <span className="text-gray-300 text-sm sm:text-base">{event.location}</span>
              </div>
            )}
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-arcade text-neon-purple mb-3">ABOUT THIS EVENT</h2>
              <div className="text-gray-300 space-y-3 sm:space-y-4 text-sm sm:text-base">
                {event.description.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            {event.prize && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-arcade text-neon-green mb-3">PRIZE POOL</h2>
                <div className="text-neon-green font-bold text-xl sm:text-2xl">{event.prize}</div>
              </div>
            )}
            
            {event.participants && event.participants.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-arcade text-neon-pink mb-3">PARTICIPATING TEAMS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {event.participants.map((team, idx) => (
                    <div key={idx} className="bg-dark-purple/30 p-3 text-center">
                      <span className="text-gray-300 text-sm">{team}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Related Events */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-pixel text-neon-blue mb-6 text-center">YOU MIGHT ALSO BE INTERESTED IN</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((placeholderIdx) => (
              <div key={placeholderIdx} className="arcade-card overflow-hidden group">
                <div className="relative h-48">
                  <img 
                    src={`https://placehold.co/600x300/1A0033/${placeholderIdx === 1 ? 'FF00FF' : placeholderIdx === 2 ? '00FFFF' : '00FF00'}?text=Related+Event+${placeholderIdx}`}
                    alt={`Related Event ${placeholderIdx}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-purple via-dark-purple/50 to-transparent"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-arcade text-neon-blue mb-2">Sample Event {placeholderIdx}</h3>
                  <p className="text-gray-300 text-sm mb-4">This is a placeholder for a related event.</p>
                  <Link to="/events" className="text-neon-green text-sm hover:text-white">
                    VIEW DETAILS →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventDetailPage; 