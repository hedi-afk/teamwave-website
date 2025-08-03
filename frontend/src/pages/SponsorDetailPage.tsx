import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import partnerService, { IPartner } from '../services/partnerService';
import uploadService from '../services/uploadService';

// Remove Sponsor interface and mock data

const SponsorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sponsor, setSponsor] = useState<IPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSponsor = async () => {
    setLoading(true);
    setError(null);
      try {
        if (!id) throw new Error('No sponsor ID provided');
        const data = await partnerService.getPartnerById(id);
        if (data.type !== 'sponsor') throw new Error('Not a sponsor');
        setSponsor(data);
      } catch (err: any) {
        setError('Sponsor not found');
      } finally {
        setLoading(false);
      }
    };
    fetchSponsor();
  }, [id]);
  
  // Get color scheme based on sponsor tier
  const getTierColors = useCallback((tier: string) => {
    switch (tier) {
      case 'official':
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-400/10',
          text: 'text-yellow-400',
          badge: 'bg-yellow-400/20 text-yellow-400'
        };
      case 'major':
        return {
          border: 'border-orange-400',
          bg: 'bg-orange-400/10',
          text: 'text-orange-400',
          badge: 'bg-orange-400/20 text-orange-400'
        };
      case 'supporting':
        return {
          border: 'border-neon-green',
          bg: 'bg-neon-green/10',
          text: 'text-neon-green',
          badge: 'bg-neon-green/20 text-neon-green'
        };
      default:
        return {
          border: 'border-neon-purple',
          bg: 'bg-neon-purple/10',
          text: 'text-neon-purple',
          badge: 'bg-neon-purple/20 text-neon-purple'
        };
    }
  }, []);
  
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
              <h2 className="text-2xl font-pixel text-white mb-4">Sponsor Not Found</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Link to="/forum?tab=sponsors" className="pixel-btn bg-neon-purple hover:bg-neon-pink transition-colors">
                Back to Sponsors
              </Link>
            </motion.div>
          </div>
        ) : sponsor ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Back to Sponsors link */}
            <div className="mb-6">
              <Link to="/forum?tab=sponsors" className="inline-flex items-center text-neon-purple hover:text-neon-pink transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sponsors
              </Link>
            </div>
            
            {/* Sponsor tier badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded text-xs font-pixel uppercase ${getTierColors(sponsor.tier).badge}`}>
                {sponsor.tier} SPONSOR
              </span>
            </div>
            
            {/* Sponsor header with logo */}
            <div className={`flex flex-col md:flex-row items-center arcade-card p-6 mb-8 ${getTierColors(sponsor.tier).border}`}>
              <div className="w-48 h-32 md:mr-8 mb-4 md:mb-0 flex-shrink-0 bg-dark-purple/50 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={sponsor.logo ? uploadService.getImageUrl(sponsor.logo) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'} 
                  alt={sponsor.name} 
                  className="max-w-full max-h-full p-2"
                  onError={e => { 
                    console.log('Sponsor detail image failed to load for:', sponsor.name, 'URL:', e.currentTarget.src);
                    e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; 
                  }}
                />
              </div>
              <div>
                <h1 className="text-4xl font-pixel text-white mb-2">{sponsor.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {sponsor.industry && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{sponsor.industry}</span>
                    </div>
                  )}
                  {sponsor.foundedYear && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Founded in {sponsor.foundedYear}</span>
                    </div>
                  )}
                  {sponsor.headquarters && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{sponsor.headquarters}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className={`prose prose-lg prose-invert max-w-none rounded-lg p-8 mb-8 arcade-card ${getTierColors(sponsor.tier).bg}`}>
              <h2 className="text-2xl font-pixel mb-4">About {sponsor.name}</h2>
              <p>{sponsor.longDescription || sponsor.description}</p>
            </div>
            
            {/* Campaign Highlights */}
            {/* Removed as per edit hint */}
            
            {/* Events Sponsored */}
            {/* Removed as per edit hint */}
            
            {/* Visit website button */}
            <div className="text-center mb-8">
              <a 
                href={sponsor.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`inline-block px-8 py-3 rounded-md font-pixel uppercase ${getTierColors(sponsor.tier).bg} ${getTierColors(sponsor.tier).text} border ${getTierColors(sponsor.tier).border} transition-colors hover:bg-opacity-70`}
              >
                Visit Official Website
              </a>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default SponsorDetailPage; 