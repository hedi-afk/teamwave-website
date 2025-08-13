import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gameService, { IGame } from '../services/gameService';
import uploadService from '../services/uploadService';
import axios from 'axios';
import config from '../config';
import Typewriter from '../components/Typewriter';

// Define interfaces for data from the API
interface Event {
  _id: string;
  name: string;
  game: string;
  startDate: string;
  image: string;
  status: string;
}

interface Team {
  _id: string;
  name: string;
  game: string;
  logo: string;
}

const HomePage: React.FC = () => {
  // State for API data
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [featuredGames, setFeaturedGames] = useState<IGame[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming events
        const eventsResponse = await axios.get(`${config.apiUrl}/events`);
        const upcomingEvents = eventsResponse.data
          .filter((event: Event) => event.status === 'upcoming')
          .slice(0, 3); // Get only the first 3 upcoming events
        
        setFeaturedEvents(upcomingEvents);
        
        // Fetch teams
        const teamsResponse = await axios.get(`${config.apiUrl}/teams`);
        setTeams(teamsResponse.data);
        
                 // Fetch featured games
         const gamesResponse = await gameService.getFeaturedGames();
         setFeaturedGames(gamesResponse);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Simple dark background to match other boxes
  const getGameBackground = () => {
    return 'bg-dark-purple/30 border border-gray-700';
  };

  return (
    <div className="bg-retro-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) contrast(1.2)' }}
          >
            <source src="/videos/background-video.mp4" type="video/mp4" />
            <source src="/videos/background-video.webm" type="video/webm" />
            {/* Fallback for browsers that don't support video */}
            <div className="w-full h-full bg-gradient-to-br from-retro-black via-dark-purple to-retro-black"></div>
          </video>
          
          {/* Dark overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Bottom gradient overlay to cover watermarks */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-retro-black via-retro-black/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto px-4"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-pixel mb-4 sm:mb-6 tracking-wide glitch-text leading-tight"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              <span className="text-neon-pink">TEAM</span>
              <span className="text-neon-blue">WAVE</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 font-arcade text-gray-300 px-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Typewriter 
                text="Join the next level of gaming community"
                speed={80}
                delay={800}
                className="text-lg sm:text-xl md:text-2xl font-arcade text-gray-300"
              />
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link 
                to="/not-found-demo" 
                className="pixel-btn bg-neon-purple text-white border-neon-purple hover:bg-white hover:text-dark-purple text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto"
              >
                JOIN NOW
              </Link>
              <Link 
                to="/events" 
                className="pixel-btn border-neon-green text-neon-green hover:bg-neon-green hover:text-retro-black text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 w-full sm:w-auto"
              >
                UPCOMING EVENTS
              </Link>
            </motion.div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div 
            className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-neon-pink/30 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div 
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-neon-blue/30 blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-retro-black to-dark-purple/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-pixel text-neon-blue mb-4">ABOUT <span className="text-neon-pink">US</span></h2>
              <div className="w-24 h-1 bg-neon-purple mx-auto mb-6"></div>
            </div>
            
            <div className="arcade-card p-4 sm:p-6 md:p-8 relative">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-neon-pink"></div>
              <div className="absolute top-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-neon-blue"></div>
              <div className="absolute bottom-0 left-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-neon-blue"></div>
              <div className="absolute bottom-0 right-0 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-neon-pink"></div>
              
              <div className="relative z-10 space-y-4 sm:space-y-6 text-gray-300 text-sm sm:text-base">
                <p className="leading-relaxed">
                  TeamWave is a dynamic e-sports association based in Tunisia, Sousse, dedicated to uniting gamers of all skill levels in a vibrant and supportive community. Founded with a passion for competitive gaming and camaraderie, we aim to foster talent, organize exciting tournaments, and create meaningful connections among gaming enthusiasts.
                </p>
                <p className="leading-relaxed">
                  Our mission is to elevate the e-sports scene in Tunisia by providing platforms for players to showcase their skills, learn from each other, and compete in a positive environment. Whether you're a casual gamer or aspiring professional, TeamWave offers resources, training, and events to help you level up your gaming experience.
                </p>
                <p className="leading-relaxed">
                  We host regular tournaments across popular titles, streaming sessions with experienced players, and community meetups to strengthen bonds beyond the digital realm. Join us and be part of a movement that's shaping the future of gaming in our region!
                </p>
              </div>
              
              {/* Animated Pixel Art Icons */}
              <div className="flex justify-center mt-6 sm:mt-8 gap-4 sm:gap-8">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-xl sm:text-2xl">🎮</span>
                </motion.div>
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-xl sm:text-2xl">🏆</span>
                </motion.div>
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="text-xl sm:text-2xl">👾</span>
                </motion.div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
              <motion.div 
                className="bg-dark-purple/50 p-4 sm:p-5 text-center border-l-4 border-neon-pink"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-arcade text-neon-pink mb-2 text-sm sm:text-base">VISION</h3>
                <p className="text-gray-300 text-xs sm:text-sm">To become the premier gaming community in Tunisia, fostering talent and promoting e-sports excellence.</p>
              </motion.div>
              
              <motion.div 
                className="bg-dark-purple/50 p-4 sm:p-5 text-center border-l-4 border-neon-blue"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="font-arcade text-neon-blue mb-2 text-sm sm:text-base">MISSION</h3>
                <p className="text-gray-300 text-xs sm:text-sm">Uniting gamers through competitive events, skill development, and creating an inclusive gaming environment.</p>
              </motion.div>
              
              <motion.div 
                className="bg-dark-purple/50 p-4 sm:p-5 text-center border-l-4 border-neon-green"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="font-arcade text-neon-green mb-2 text-sm sm:text-base">VALUES</h3>
                <p className="text-gray-300 text-xs sm:text-sm">Sportsmanship, community support, continuous improvement, and respecting diversity in gaming.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-dark-purple/10 via-retro-black to-dark-purple/20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-neon-pink/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-neon-green/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-pixel text-white mb-4">
              <span className="text-neon-pink">FEATURED</span>{" "}
              <span className="text-neon-blue">GAMES</span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue mx-auto mb-6"></div>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg sm:text-xl px-4 leading-relaxed">
              Our professional teams compete at the highest level in these premier titles. 
              Each game represents our commitment to excellence in competitive esports.
            </p>
          </motion.div>

          {loading ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center space-x-3">
                <div className="w-6 h-6 bg-neon-pink rounded-full animate-pulse"></div>
                <div className="w-6 h-6 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-6 h-6 bg-neon-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-neon-purple text-xl font-pixel mt-4">LOADING GAMES...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-neon-red text-xl">{error}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredGames.map((game, index) => (
                <motion.div
                  key={game._id}
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-dark-purple/40 to-dark-purple/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-neon-purple/20 transition-all duration-500">
                    {/* Animated border gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"></div>
                    
                    {/* Card Header with Game Icon */}
                    <div className="relative p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-2xl">🎮</span>
                          </div>
                                                     <div>
                             <h3 className="text-xl sm:text-2xl font-pixel text-white group-hover:text-neon-blue transition-colors duration-300">
                               {game.name}
                             </h3>
                             <p className="text-neon-green text-sm font-arcade">Pro Team Active</p>
                           </div>
                        </div>
                        
                        {/* Featured Badge */}
                        <div className="relative">
                          <div className="absolute inset-0 bg-neon-pink rounded-full blur-sm opacity-50"></div>
                          <div className="relative bg-neon-pink text-dark-purple text-xs font-bold px-3 py-1 rounded-full">
                            FEATURED
                          </div>
                        </div>
                      </div>

                                             {/* Game Stats */}
                       <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="bg-dark-purple/30 rounded-lg p-3 text-center border border-gray-600/30">
                           <div className="text-neon-green text-lg font-pixel">Pro</div>
                           <div className="text-gray-400 text-xs">Team</div>
                         </div>
                         <div className="bg-dark-purple/30 rounded-lg p-3 text-center border border-gray-600/30">
                           <div className="text-neon-blue text-lg font-pixel">Active</div>
                           <div className="text-gray-400 text-xs">Competing</div>
                         </div>
                       </div>

                                             
                    </div>

                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Floating particles effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div 
                      className="absolute top-4 right-4 w-2 h-2 bg-neon-pink rounded-full"
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    />
                    <motion.div 
                      className="absolute bottom-6 left-6 w-1 h-1 bg-neon-blue rounded-full"
                      animate={{ 
                        y: [0, -8, 0],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

                     {/* Call to Action */}
           <motion.div 
             className="text-center mt-12 sm:mt-16"
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.6, delay: 0.3 }}
           >
             <div className="inline-flex items-center space-x-4 bg-dark-purple/30 backdrop-blur-sm border border-gray-700/50 rounded-full px-6 py-3">
               <span className="text-neon-green text-sm font-arcade">Support our pro teams?</span>
               <Link 
                 to="/members?section=teams" 
                 className="pixel-btn bg-neon-green text-dark-purple border-neon-green hover:bg-dark-purple hover:text-neon-green text-sm font-arcade transition-all duration-300"
               >
                 MEET OUR TEAMS
               </Link>
             </div>
           </motion.div>
        </div>
      </section>

      {/* Our Teams Section */}
      <section className="py-16 bg-dark-purple/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-pixel text-neon-pink mb-4">OUR TEAMS</h2>
            <div className="w-24 h-1 bg-neon-pink mx-auto mb-6"></div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Meet our professional e-sports teams competing at the highest levels across multiple games
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <p className="text-neon-purple text-xl font-pixel">LOADING TEAMS...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-neon-red text-xl">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teams.map((team, index) => (
                <motion.div
                  key={team._id}
                  className="arcade-card bg-dark-purple/30 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-neon-blue mb-4">
                      <img 
                        src={`${config.imageBaseUrl}${team.logo}`} 
                        alt={team.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://placehold.co/200/1A0033/FFFFFF?text=${team.game}`;
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-arcade text-neon-blue mb-2">{team.name}</h3>
                    <p className="text-neon-green text-sm mb-4">{team.game}</p>
                    <Link 
                      to={`/members?team=${team.name}`} 
                      className="inline-block pixel-btn bg-neon-blue text-dark-purple text-sm"
                    >
                      VIEW TEAM
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-gradient-to-b from-retro-black to-dark-purple/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-pixel text-neon-green mb-4">UPCOMING EVENTS</h2>
            <div className="w-24 h-1 bg-neon-green mx-auto mb-6"></div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Join our exciting tournaments and gaming events
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <p className="text-neon-purple text-xl font-pixel">LOADING EVENTS...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-neon-red text-xl">{error}</p>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-300 text-xl">No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  className="arcade-card overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48">
                    <img 
                      src={`${config.imageBaseUrl}${event.image}`} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/600x300/1A0033/00FFFF?text=${event.game}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-purple via-dark-purple/50 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-neon-green text-dark-purple text-xs font-bold px-2 py-1 rounded">
                      {event.game}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-pixel text-neon-blue mb-2">{event.name}</h3>
                    <p className="text-neon-pink mb-4">{formatDate(event.startDate)}</p>
                    
                    <Link 
                      to={`/events/${event._id}`} 
                      className="inline-block w-full pixel-btn text-center bg-neon-green text-dark-purple"
                    >
                      VIEW DETAILS
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link 
              to="/events" 
              className="inline-block pixel-btn border-neon-green text-neon-green hover:bg-neon-green hover:text-retro-black"
            >
              VIEW ALL EVENTS
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-dark-purple/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "10K+", label: "MEMBERS" },
              { stat: "50+", label: "TOURNAMENTS" },
              { stat: "200+", label: "EVENTS" },
              { stat: "5+", label: "YEARS" },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6"
              >
                <h3 className="text-4xl md:text-5xl font-pixel text-neon-pink mb-2">{item.stat}</h3>
                <p className="text-lg font-arcade text-gray-300">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-retro-black to-dark-purple/20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="arcade-card bg-dark-purple/40 border-neon-blue p-10 md:p-16 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-pixel text-white mb-6">
              <span className="text-neon-pink">JOIN</span> <span className="text-neon-blue">TEAMWAVE</span> <span className="text-neon-green">TODAY</span>
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Whether you're a seasoned pro or a casual gamer, there's a place for you in our community. 
              Join TeamWave and take your gaming experience to the next level!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="pixel-btn bg-neon-blue text-retro-black border-neon-blue hover:bg-retro-black hover:text-neon-blue">
                CONTACT US
              </Link>
              <Link to="/events" className="pixel-btn bg-neon-pink text-retro-black border-neon-pink hover:bg-retro-black hover:text-neon-pink">
                JOIN AN EVENT
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 