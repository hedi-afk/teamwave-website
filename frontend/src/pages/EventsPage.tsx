import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';

import uploadService from '../services/uploadService';

interface Event {
  _id: string;
  name: string;
  description: string;
  image: string;
  game: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  teams: string[];
  prizePool: number;
  format: string;
  registrationDeadline: string;
  isPublic: boolean;
}

// Function to generate image URL (external or internal) - Use uploadService
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return 'https://placehold.co/800x400/1A0033/00FFFF?text=NO+IMAGE';
  
  // Use the central uploadService for consistent URL generation
  return uploadService.getImageUrl(imagePath);
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGame, setFilterGame] = useState<string>('all');


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${config.apiUrl}/events`);
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching from API:', error);
        
        // If API fails, set empty array - don't use mock data in production
        setEvents([]);

        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get unique games from events
  const games = ['all', ...Array.from(new Set(events.map(event => event.game.toLowerCase())))];

  // Filter events by status and game
  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesGame = filterGame === 'all' || event.game.toLowerCase() === filterGame;
    return matchesStatus && matchesGame;
  });

  // Sort events by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-neon-green text-black';
      case 'ongoing':
        return 'bg-neon-blue text-black';
      case 'completed':
        return 'bg-neon-purple text-white';
      case 'cancelled':
        return 'bg-neon-red text-white';
      default:
        return 'bg-gray-700 text-white';
    }
  };

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
    <div className="bg-retro-black min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-12">

      
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-pixel text-neon-green mb-3 sm:mb-4 px-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            EVENTS & TOURNAMENTS
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join our exciting gaming tournaments and community events
          </motion.p>
        </div>

        {/* Filters */}
        <div className="arcade-card mb-8">
          <div className="p-4">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-neon-purple text-white' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-purple/40'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                ALL EVENTS
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'upcoming' 
                    ? 'bg-neon-green text-black' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-green/40'
                }`}
                onClick={() => setFilterStatus('upcoming')}
              >
                UPCOMING
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'ongoing' 
                    ? 'bg-neon-blue text-black' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-blue/40'
                }`}
                onClick={() => setFilterStatus('ongoing')}
              >
                ONGOING
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterStatus === 'completed' 
                    ? 'bg-neon-purple text-white' 
                    : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-purple/40'
                }`}
                onClick={() => setFilterStatus('completed')}
              >
                COMPLETED
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              {games.map((game) => (
                <button
                  key={game}
                  className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                    filterGame === game 
                      ? 'bg-neon-pink text-black' 
                      : 'bg-dark-purple/50 text-gray-300 hover:bg-neon-pink/40'
                  }`}
                  onClick={() => setFilterGame(game)}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-neon-purple text-xl font-pixel">LOADING EVENTS...</div>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="arcade-card p-6 text-center">
            <div className="text-neon-red text-xl font-pixel mb-2">ERROR</div>
            <p className="text-gray-300">{error}</p>
          </div>
        )}

        {/* Events List */}
        {!loading && !error && (
          <div className="space-y-4 sm:space-y-6 mb-12">
            {sortedEvents.length === 0 ? (
              <div className="arcade-card p-6 sm:p-8 text-center">
                <p className="text-gray-300 text-base sm:text-lg">No events found matching your criteria.</p>
              </div>
            ) : (
              sortedEvents.map((event) => (
                <motion.div 
                  key={event._id} 
                  className="arcade-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="relative md:col-span-1">
                      <div className="w-full h-40 sm:h-48 md:h-64 overflow-hidden">
                        <img 
                          src={getImageUrl(event.image)}
                          alt={event.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://placehold.co/800x400/1A0033/${event.game === 'CS:GO' ? 'FFFFFF' : (event.game === 'Valorant' ? 'FF00FF' : '00FF00')}?text=${event.game}`;
                          }}
                        />
                      </div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-retro-black/80 to-transparent"></div>
                      <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 md:col-span-2 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-pixel text-neon-green mb-2">{event.name}</h2>
                        <p className="text-gray-300 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{event.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div>
                            <h3 className="text-xs uppercase text-gray-500 mb-1">Date & Time</h3>
                            <p className="text-white text-xs sm:text-sm">
                              {formatDate(event.startDate)}
                              {event.endDate && ` - ${formatDate(event.endDate)}`}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-xs uppercase text-gray-500 mb-1">Location</h3>
                            <p className="text-white text-xs sm:text-sm">{event.location}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-xs uppercase text-gray-500 mb-1">Game</h3>
                            <p className="text-neon-green text-xs sm:text-sm">{event.game}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-xs uppercase text-gray-500 mb-1">Format</h3>
                            <p className="text-white text-xs sm:text-sm">{event.format}</p>
                          </div>
                        </div>

                        {event.prizePool > 0 && (
                          <div className="mb-3 sm:mb-4">
                            <h3 className="text-xs uppercase text-gray-500 mb-1">Prize Pool</h3>
                            <p className="text-neon-pink text-base sm:text-lg font-arcade">${event.prizePool.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                        <div className="w-full sm:w-auto">
                          {event.status === 'upcoming' && event.registrationDeadline && (
                            <p className="text-xs text-gray-400">
                              Registration Deadline: {formatDate(event.registrationDeadline)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <Link to={`/events/${event._id}`} className="pixel-btn bg-neon-blue text-retro-black text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto text-center">
                            VIEW DETAILS
                          </Link>
                          
                          {event.status === 'upcoming' && (
                            <Link to={`/events/${event._id}`} className="pixel-btn bg-neon-green text-retro-black text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 w-full sm:w-auto text-center">
                              REGISTER
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 