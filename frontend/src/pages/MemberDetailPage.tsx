import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import memberService, { IMember } from '../services/memberService';
import uploadService from '../services/uploadService';
import { format } from 'date-fns';
import SafeText from '../utils/SafeText';

const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<IMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error('No member ID provided');
        const data = await memberService.getMemberById(id);
        setMember(data);
      } catch (err: any) {
        setError('Member not found');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'MMMM yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const getImageUrl = (imagePath: string): string => {
    try {
      return uploadService.getImageUrl(imagePath);
    } catch (error) {
      console.error('Error processing image URL:', error);
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-retro-black">
      <div className="container mx-auto px-4 py-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-red-500/10 rounded-lg border border-red-500/30 max-w-md mx-auto p-8"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-pixel text-white mb-4">Member Not Found</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link to="/members" className="pixel-btn bg-neon-purple hover:bg-neon-pink transition-colors">
                Back to Members
              </Link>
            </motion.div>
          </div>
        ) : member ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
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

            {/* Member header with avatar */}
            <div className="flex flex-col md:flex-row items-center arcade-card p-6 mb-8 border-neon-purple">
              <div className="w-48 h-48 md:mr-8 mb-4 md:mb-0 flex-shrink-0 bg-dark-purple/50 rounded-full flex items-center justify-center overflow-hidden border-2 border-neon-purple">
                <img 
                  src={member.avatar ? getImageUrl(member.avatar) : 'https://placehold.co/200x200/1A0033/FFFFFF?text=AVATAR'} 
                  alt={member.username} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const initials = member.username.slice(0, 2).toUpperCase();
                    target.src = `https://placehold.co/200x200/8A2BE2/FFFFFF?text=${initials}`;
                  }}
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-pixel text-white mb-2">
                  <SafeText>{member.fullName}</SafeText>
                </h1>
                <p className="text-xl font-arcade text-neon-purple mb-2">@{member.username}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 justify-center md:justify-start">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Primary Game: <SafeText>{member.primaryGame || 'General'}</SafeText></span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Role: <SafeText>{member.role}</SafeText></span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Joined: {formatDate(member.joinDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {member.bio && (
              <div className="prose prose-lg prose-invert max-w-none rounded-lg p-8 mb-8 arcade-card bg-dark-purple/30">
                <h2 className="text-2xl font-pixel mb-4">About <SafeText>{member.username}</SafeText></h2>
                <p><SafeText>{member.bio}</SafeText></p>
              </div>
            )}

            {/* Secondary Games */}
            {member.secondaryGames && member.secondaryGames.length > 0 && (
              <div className="rounded-lg p-8 mb-8 arcade-card bg-dark-purple/30">
                <h2 className="text-2xl font-pixel text-white mb-6">Secondary Games</h2>
                <div className="flex flex-wrap gap-3">
                  {member.secondaryGames.map((game: string, index: number) => (
                    <span 
                      key={index} 
                      className="inline-block bg-neon-purple/20 text-neon-purple border border-neon-purple px-4 py-2 rounded-lg font-arcade"
                    >
                      <SafeText>{game}</SafeText>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {member.achievements && member.achievements.length > 0 && (
              <div className="rounded-lg p-8 mb-8 arcade-card bg-dark-purple/30">
                <h2 className="text-2xl font-pixel text-white mb-6">Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg border border-yellow-400/30 bg-yellow-400/10"
                    >
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-yellow-400">
                          <SafeText>{achievement}</SafeText>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {member.socialLinks && Object.values(member.socialLinks).some(link => link) && (
              <div className="rounded-lg p-8 mb-8 arcade-card bg-dark-purple/30">
                <h2 className="text-2xl font-pixel text-white mb-6">Social Media</h2>
                <div className="flex flex-wrap gap-4">
                  {member.socialLinks.twitter && (
                    <a 
                      href={member.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </a>
                  )}
                  {member.socialLinks.instagram && (
                    <a 
                      href={member.socialLinks.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-pink-500/20 text-pink-400 border border-pink-500 rounded-lg hover:bg-pink-500/30 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  {member.socialLinks.twitch && (
                    <a 
                      href={member.socialLinks.twitch} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500 rounded-lg hover:bg-purple-500/30 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                      </svg>
                      Twitch
                    </a>
                  )}
                  {member.socialLinks.youtube && (
                    <a 
                      href={member.socialLinks.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      YouTube
                    </a>
                  )}
                  {member.socialLinks.discord && (
                    <a 
                      href={member.socialLinks.discord} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500 rounded-lg hover:bg-indigo-500/30 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                      </svg>
                      Discord
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default MemberDetailPage; 