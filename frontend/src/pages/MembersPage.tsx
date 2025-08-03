import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import memberService, { IMember } from '../services/memberService';
import teamService from '../services/teamService';
import gameService from '../services/gameService';
import uploadService from '../services/uploadService';
import SafeText from '../utils/SafeText';

interface ITeam {
  _id: string;
  name: string;
  game: string;
  description: string;
  logo: string;
  status: string;
  members: string[];
  achievements: Array<{
    title: string;
    date: Date;
    description: string;
  }>;
}

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<IMember[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching members and teams from API...');
        
                  // Fetch members
          const membersData = await memberService.getAllMembers();
          console.log(`Loaded ${membersData.length} members from API`);
          
          // Fetch teams
          const teamsData = await teamService.getAllTeams();
          console.log(`Loaded ${teamsData.length} teams from API`);
        
        setMembers(membersData);
        setTeams(teamsData);
        setError('');
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check the API connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter members by role
  const players = members.filter(member => member.role === 'Player');
  const coaches = members.filter(member => member.role === 'Coach');
  const contentCreators = members.filter(member => 
    member.role === 'Content Creator' || member.role === 'Social Media Manager'
  );

  // Get members for a specific team
  const getTeamMembers = (team: ITeam) => {
    return members.filter(member => member._id && team.members.includes(member._id));
  };

  // Get image URL
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return `https://placehold.co/100/8A2BE2/FFFFFF?text=TW`;
    return uploadService.getImageUrl(imagePath);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="bg-retro-black min-h-screen">
        {/* Hero Section */}
      <section className="relative pt-24 pb-12 bg-gradient-to-b from-dark-purple/50 to-retro-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-pixel text-white mb-6">
              <span className="text-neon-pink">TEAM</span>
              <span className="text-neon-blue">WAVE</span>
              <br />
              <span className="text-neon-green">MEMBERS</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet our professional players, coaches, and content creators
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Navigation */}
      <section className="py-6 bg-dark-purple/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-arcade text-sm transition-all duration-300 ${
                activeFilter === 'all'
                  ? 'bg-neon-pink text-retro-black'
                  : 'bg-dark-purple text-white hover:bg-neon-pink/20'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setActiveFilter('teams')}
              className={`px-4 py-2 rounded-lg font-arcade text-sm transition-all duration-300 ${
                activeFilter === 'teams'
                  ? 'bg-neon-blue text-retro-black'
                  : 'bg-dark-purple text-white hover:bg-neon-blue/20'
              }`}
            >
              TEAMS
            </button>
                <button
              onClick={() => setActiveFilter('coaches')}
              className={`px-4 py-2 rounded-lg font-arcade text-sm transition-all duration-300 ${
                activeFilter === 'coaches'
                  ? 'bg-neon-green text-retro-black'
                  : 'bg-dark-purple text-white hover:bg-neon-green/20'
              }`}
            >
              COACHES
                </button>
                <button
              onClick={() => setActiveFilter('content')}
              className={`px-4 py-2 rounded-lg font-arcade text-sm transition-all duration-300 ${
                activeFilter === 'content'
                  ? 'bg-neon-purple text-retro-black'
                  : 'bg-dark-purple text-white hover:bg-neon-purple/20'
              }`}
            >
              CONTENT
                </button>
          </div>
        </div>
      </section>

        {/* Loading State */}
        {loading && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-neon-purple text-2xl font-pixel">LOADING...</div>
          </div>
        </section>
        )}
        
        {/* Error State */}
        {error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
          <div className="arcade-card p-6 text-center">
            <div className="text-neon-red text-xl font-pixel mb-2">ERROR</div>
            <p className="text-gray-300">{error}</p>
          </div>
          </div>
        </section>
        )}

      {/* Content */}
        {!loading && !error && (
        <div className="container mx-auto px-4 py-8">
          {/* Game Teams Section */}
          {activeFilter === 'all' || activeFilter === 'teams' ? (
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-pixel text-neon-blue mb-2">
                  🏆 GAME TEAMS
                </h2>
                <p className="text-gray-300">
                  Our professional teams competing at the highest levels
                </p>
              </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          >
                {teams.length === 0 ? (
              <div className="col-span-full text-center py-8">
                    <p className="text-gray-300">No teams found. Teams will appear here once created.</p>
              </div>
            ) : (
                  teams.map((team) => {
                    const teamMembers = getTeamMembers(team);
                    return (
                <motion.div
                        key={team._id}
                  variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="arcade-card bg-dark-purple/30 overflow-hidden group flex flex-col h-full"
                      >
                        {/* Team Header */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-neon-blue flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                              <img 
                                src={getImageUrl(team.logo)} 
                                alt={team.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://placehold.co/100/8A2BE2/FFFFFF?text=${team.game.slice(0, 2)}`;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-pixel text-white mb-1 truncate">{team.name}</h3>
                              <p className="text-neon-green text-sm font-arcade mb-2">{team.game}</p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full font-arcade ${
                                team.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                team.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {team.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-dark-purple/50 rounded-lg">
                              <div className="text-neon-blue font-arcade text-lg">{teamMembers.length}</div>
                              <div className="text-gray-400 text-xs">Members</div>
                            </div>
                            <div className="text-center p-3 bg-dark-purple/50 rounded-lg">
                              <div className="text-neon-green font-arcade text-lg">{team.achievements?.length || 0}</div>
                              <div className="text-gray-400 text-xs">Achievements</div>
                            </div>
                          </div>
                          
                          {/* Quick Member Preview - Fixed Height */}
                          <div className="mb-4 flex-1">
                            <div className="text-gray-400 text-xs mb-3 font-semibold">Team Roster:</div>
                            <div className="h-32 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-neon-purple/30 scrollbar-track-dark-purple/20 hover:scrollbar-thumb-neon-purple/50">
                              {teamMembers.length === 0 ? (
                                <div className="text-center py-8">
                                  <p className="text-gray-500 text-xs">No members assigned</p>
                                </div>
                              ) : (
                                teamMembers.map((member) => (
                                  <div key={member._id} className="flex items-center p-2 bg-dark-purple/30 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-neon-purple flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={getImageUrl(member.avatar)} 
                        alt={member.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const initials = member.username.slice(0, 2).toUpperCase();
                          target.src = `https://placehold.co/100/8A2BE2/FFFFFF?text=${initials}`;
                        }}
                      />
                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white text-sm font-medium truncate">
                        <SafeText>{member.username}</SafeText>
                                      </div>
                                      <div className="text-neon-green text-xs">
                                        <SafeText>{member.role}</SafeText>
                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                          
                          {/* View Details Button - Fixed at bottom */}
                          <div className="mt-auto">
                            <Link 
                              to={`/teams/${team._id}`}
                              className="w-full pixel-btn bg-neon-blue hover:bg-neon-pink text-white text-sm font-arcade transition-all duration-300"
                            >
                              VIEW TEAM DETAILS
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </section>
          ) : null}

          {/* Coaches Section */}
          {activeFilter === 'all' || activeFilter === 'coaches' ? (
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-pixel text-neon-green mb-2">
                  👨‍🏫 COACHES
                </h2>
                <p className="text-gray-300">
                  Our experienced coaches who guide our teams to victory
                </p>
              </motion.div>

              {coaches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">No coaches found.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {coaches.map((coach) => (
                    <motion.div
                      key={coach._id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="arcade-card bg-dark-purple/30 overflow-hidden group"
                    >
                      <div className="p-4">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-neon-green flex items-center justify-center overflow-hidden mx-auto mb-3">
                            <img 
                              src={getImageUrl(coach.avatar)} 
                              alt={coach.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const initials = coach.username.slice(0, 2).toUpperCase();
                                target.src = `https://placehold.co/100/00FF00/000000?text=${initials}`;
                              }}
                            />
                          </div>
                          <h3 className="text-lg font-pixel text-white mb-1">
                            <SafeText>{coach.username}</SafeText>
                          </h3>
                          <p className="text-neon-green text-sm font-arcade mb-3">
                            <SafeText>{coach.role}</SafeText>
                          </p>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="p-2 bg-dark-purple/30 rounded-lg">
                            <span className="text-neon-blue text-xs font-semibold">Game:</span>
                            <p className="text-white text-sm mt-1">{coach.primaryGame || 'General'}</p>
                          </div>
                          <div className="p-2 bg-dark-purple/30 rounded-lg">
                            <span className="text-neon-blue text-xs font-semibold">Rank:</span>
                            <p className="text-white text-sm mt-1">{coach.rank}</p>
                    </div>
                  </div>
                  
                        <Link 
                          to={`/members/${coach._id}`}
                          className="w-full pixel-btn bg-neon-green hover:bg-neon-pink text-white text-xs font-arcade transition-all duration-300"
                        >
                          VIEW PROFILE
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </section>
          ) : null}

          {/* Content Team Section */}
          {activeFilter === 'all' || activeFilter === 'content' ? (
            <section className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-pixel text-neon-purple mb-2">
                  🎬 CONTENT TEAM
                </h2>
                <p className="text-gray-300">
                  Our creative content creators who bring TeamWave to life
                </p>
              </motion.div>

              {contentCreators.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">No content creators found.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {contentCreators.map((creator) => (
                    <motion.div
                      key={creator._id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="arcade-card bg-dark-purple/30 overflow-hidden group"
                    >
                      <div className="p-4">
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 rounded-full bg-neon-purple flex items-center justify-center overflow-hidden mx-auto mb-3">
                            <img 
                              src={getImageUrl(creator.avatar)} 
                              alt={creator.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const initials = creator.username.slice(0, 2).toUpperCase();
                                target.src = `https://placehold.co/100/FF00FF/000000?text=${initials}`;
                              }}
                            />
                    </div>
                          <h3 className="text-lg font-pixel text-white mb-1">
                            <SafeText>{creator.username}</SafeText>
                          </h3>
                          <p className="text-neon-purple text-sm font-arcade mb-3">
                            <SafeText>{creator.role}</SafeText>
                          </p>
                  </div>
                  
                        <div className="space-y-3 mb-4">
                          <div className="p-2 bg-dark-purple/30 rounded-lg">
                            <span className="text-neon-blue text-xs font-semibold">Rank:</span>
                            <p className="text-white text-sm mt-1">{creator.rank}</p>
                          </div>
                          <div className="p-2 bg-dark-purple/30 rounded-lg">
                            <span className="text-neon-blue text-xs font-semibold">Social:</span>
                            <div className="flex gap-2 mt-2">
                              {creator.socialLinks.twitter && (
                                <a 
                                  href={creator.socialLinks.twitter} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Twitter"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                  </svg>
                                </a>
                              )}
                              {creator.socialLinks.instagram && (
                                <a 
                                  href={creator.socialLinks.instagram} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-pink-400 hover:text-pink-300 transition-colors"
                                  title="Instagram"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.244s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244z"/>
                                  </svg>
                                </a>
                              )}
                              {creator.socialLinks.twitch && (
                                <a 
                                  href={creator.socialLinks.twitch} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 transition-colors"
                                  title="Twitch"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                  </svg>
                                </a>
                              )}
                              {creator.socialLinks.youtube && (
                                <a 
                                  href={creator.socialLinks.youtube} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="YouTube"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                </a>
                              )}
                              {creator.socialLinks.discord && (
                                <a 
                                  href={`https://discord.com/users/${creator.socialLinks.discord}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                                  title="Discord"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                            {!creator.socialLinks.twitter && !creator.socialLinks.instagram && !creator.socialLinks.twitch && !creator.socialLinks.youtube && !creator.socialLinks.discord && (
                              <p className="text-gray-400 text-xs mt-1">No social links</p>
                      )}
                    </div>
                  </div>
                  
                    <Link 
                          to={`/members/${creator._id}`}
                          className="w-full pixel-btn bg-neon-purple hover:bg-neon-pink text-white text-xs font-arcade transition-all duration-300"
                    >
                          VIEW PROFILE
                    </Link>
                  </div>
                    </motion.div>
                  ))}
                </motion.div>
            )}
            </section>
          ) : null}
        </div>
        )}
    </div>
  );
};

export default MembersPage; 