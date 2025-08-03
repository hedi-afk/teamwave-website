import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';
import { IMember } from '../services/memberService';
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

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<ITeam | null>(null);
  const [teamMembers, setTeamMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('No team ID provided');
        
        // Fetch team data
        const teamResponse = await axios.get(`${config.apiUrl}/teams/${id}`);
        const teamData = teamResponse.data;
        setTeam(teamData);
        
        // Fetch all members to filter team members
        const membersResponse = await axios.get(`${config.apiUrl}/members`);
        const allMembers = membersResponse.data;
        
        // Filter members that belong to this team
        const members = allMembers.filter((member: IMember) => 
          teamData.members.includes(member._id)
        );
        setTeamMembers(members);
        
      } catch (err: any) {
        console.error('Error fetching team data:', err);
        setError('Team not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id]);

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return `https://placehold.co/100/8A2BE2/FFFFFF?text=TW`;
    return uploadService.getImageUrl(imagePath);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Unknown date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-black flex items-center justify-center">
        <div className="text-neon-purple text-2xl font-pixel">LOADING TEAM...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-retro-black">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-red-500/10 rounded-lg border border-red-500/30 max-w-md mx-auto p-8"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-pixel text-white mb-4">Team Not Found</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link to="/members" className="pixel-btn bg-neon-purple hover:bg-neon-pink transition-colors">
                Back to Members
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-black">
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Back to Members link */}
          <div className="mb-6">
            <Link to="/members" className="inline-flex items-center text-neon-purple hover:text-neon-pink transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Members
            </Link>
          </div>

          {/* Team Header */}
          <div className="arcade-card p-8 mb-8 border-neon-blue">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-32 h-32 md:mr-8 mb-4 md:mb-0 flex-shrink-0 bg-neon-blue rounded-full flex items-center justify-center overflow-hidden border-4 border-neon-blue">
                <img 
                  src={getImageUrl(team.logo)} 
                  alt={team.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/200/8A2BE2/FFFFFF?text=${team.game.slice(0, 2)}`;
                  }}
                />
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl md:text-5xl font-pixel text-white mb-2">
                  {team.name}
                </h1>
                <p className="text-2xl font-arcade text-neon-green mb-3">{team.game}</p>
                <p className="text-gray-300 mb-6 max-w-2xl">{team.description}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <span className={`px-4 py-2 text-sm rounded-full font-arcade ${
                    team.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    team.status === 'inactive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {team.status.toUpperCase()}
                  </span>
                  <span className="px-4 py-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-full font-arcade text-sm">
                    {teamMembers.length} MEMBERS
                  </span>
                  <span className="px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-full font-arcade text-sm">
                    {team.achievements?.length || 0} ACHIEVEMENTS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="mb-8">
            <h2 className="text-3xl font-pixel text-neon-pink mb-6">Team Roster</h2>
            {teamMembers.length === 0 ? (
              <div className="arcade-card p-8 text-center">
                <p className="text-gray-300 text-lg">No members assigned to this team yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member) => (
                  <motion.div
                    key={member._id}
                    whileHover={{ y: -5 }}
                    className="arcade-card bg-dark-purple/30 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-neon-purple flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
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
                          <h3 className="text-xl font-pixel text-white mb-1">
                            <SafeText>{member.username}</SafeText>
                          </h3>
                          <p className="text-neon-green font-arcade">
                            <SafeText>{member.role}</SafeText>
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="p-2 bg-dark-purple/30 rounded-lg">
                          <span className="text-neon-blue text-sm font-semibold">Rank:</span>
                          <p className="text-white text-sm mt-1">{member.rank}</p>
                        </div>
                        
                        <div className="p-2 bg-dark-purple/30 rounded-lg">
                          <span className="text-neon-blue text-sm font-semibold">Joined:</span>
                          <p className="text-white text-sm mt-1">{formatDate(member.joinDate)}</p>
                        </div>
                        
                        {member.bio && (
                          <div className="p-2 bg-dark-purple/30 rounded-lg">
                            <span className="text-neon-blue text-sm font-semibold">Bio:</span>
                            <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                              <SafeText>{member.bio}</SafeText>
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        to={`/members/${member._id}`}
                        className="w-full pixel-btn bg-neon-purple hover:bg-neon-pink text-white text-sm font-arcade transition-all duration-300"
                      >
                        VIEW PROFILE
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Team Achievements */}
          {team.achievements && team.achievements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-3xl font-pixel text-neon-green mb-6">Team Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {team.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="arcade-card bg-dark-purple/30 p-6 border border-yellow-400/30"
                  >
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-pixel text-yellow-400 mb-2">
                          <SafeText>{achievement.title}</SafeText>
                        </h3>
                        <p className="text-gray-300 mb-2">
                          <SafeText>{achievement.description}</SafeText>
                        </p>
                        <p className="text-gray-400 text-sm">
                          {formatDate(achievement.date)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamDetailPage; 