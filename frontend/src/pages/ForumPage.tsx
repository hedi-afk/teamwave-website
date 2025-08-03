import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import newsService, { INewsArticle } from '../services/newsService';
import partnerService, { IPartner } from '../services/partnerService';
import videoService, { IVideo } from '../services/videoService';
import uploadService from '../services/uploadService';
import FallbackImage from '../components/ui/FallbackImage';
import SafeText from '../utils/SafeText';
import config from '../config';

interface NewsArticle {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: 'announcement' | 'event' | 'team' | 'community' | 'partnership';
}

// Using the IVideo interface from videoService instead of local Video interface

const NewsPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'news' | 'partners' | 'sponsors' | 'videos'>('news');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for API data
  const [newsArticles, setNewsArticles] = useState<INewsArticle[]>([]);
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [sponsors, setSponsors] = useState<IPartner[]>([]);
  const [videos, setVideos] = useState<IVideo[]>([]);

  // Add a ref to store processed image URLs for caching
  const processedImageCache = useRef<Record<string, string>>({});
  
  // Use useCallback for getImageUrl to maintain stable references
  const getImageUrl = useCallback((imagePath: string, articleTitle: string): string => {
    // Check cache first
    if (processedImageCache.current[imagePath]) {
      return processedImageCache.current[imagePath];
    }
    
    try {
      const url = uploadService.getImageUrl(imagePath);
      console.log(`Processed image for article "${articleTitle}": ${url}`);
      // Store in cache
      processedImageCache.current[imagePath] = url;
      return url;
    } catch (err) {
      console.error(`Error processing image for article "${articleTitle}":`, err);
      return ''; // Return empty string to trigger fallback
    }
  }, []);

  // Safe getImageUrl for partners/sponsors (similar to news but without article title)
  const getPartnerImageUrl = useCallback((imagePath: string, partnerName: string): string => {
    // Check cache first
    if (processedImageCache.current[imagePath]) {
      return processedImageCache.current[imagePath];
    }
    
    try {
      const url = uploadService.getImageUrl(imagePath);
      console.log(`Processed image for partner "${partnerName}": ${url}`);
      // Store in cache
      processedImageCache.current[imagePath] = url;
      return url;
    } catch (err) {
      console.error(`Error processing image for partner "${partnerName}":`, err);
      return ''; // Return empty string to trigger fallback
    }
  }, []);

  // Fetch partners and sponsors from API
  useEffect(() => {
    const fetchPartnersAndSponsors = async () => {
      try {
        console.log('Fetching partners and sponsors');
        
        // Fetch active partners
        const partnersData = await partnerService.getAllPartners('partner', true);
        console.log('Received partners:', partnersData);
        setPartners(partnersData);
        
        // Fetch active sponsors
        const sponsorsData = await partnerService.getAllPartners('sponsor', true);
        console.log('Received sponsors:', sponsorsData);
        setSponsors(sponsorsData);
      } catch (err: any) {
        console.error('Error fetching partners/sponsors:', err);
        
        // Provide more specific error messages
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
          setError(`Failed to load partners/sponsors: Server error ${err.response.status}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('Could not connect to the server. Please check if the backend is running.');
        } else {
          setError(`Failed to load partners/sponsors: ${err.message || 'Unknown error'}`);
        }
        
        // If API fails, set empty arrays
        setPartners([]);
        setSponsors([]);
      }
    };

    fetchPartnersAndSponsors();
  }, []);

  // Fetch news articles from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching published news articles for ForumPage');
        const data = await newsService.getPublishedArticles();
        console.log('Received published articles:', data);
        setNewsArticles(data);
      } catch (err: any) {
        console.error('Error fetching published news:', err);
        
        // Provide more specific error messages
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
          setError(`Failed to load news articles: Server error ${err.response.status}`);
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('Could not connect to the server. Please check if the backend is running.');
        } else {
          setError(`Failed to load news articles: ${err.message || 'Unknown error'}`);
        }
        
        // If API fails, set empty array - don't use mock data in production
        setNewsArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videoService.getAllVideos({ isPublic: true });
        console.log('Fetched videos:', response.videos);
        setVideos(response.videos);
      } catch (err: any) {
        console.error('Error fetching videos:', err);
        // If API fails, set empty array
        setVideos([]);
      }
    };

    fetchVideos();
  }, []);

  // Convert the backend news articles to match the format expected by the UI
  const convertedNewsArticles: NewsArticle[] = React.useMemo(() => {
    return newsArticles.map(article => {
      // Process image path through our cached getImageUrl function
      const imagePath = getImageUrl(article.image, article.title);
      
      return {
        _id: article._id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        image: imagePath,
        date: typeof article.date === 'string' ? article.date : article.date.toISOString(),
        author: article.author,
        category: article.category as 'announcement' | 'event' | 'team' | 'community' | 'partnership'
      };
    });
  }, [newsArticles, getImageUrl]);

  // Filter news based on search term
  const filteredNews = convertedNewsArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter for videos
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check URL parameters for tab switching
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (tab === 'partners') {
      setActiveTab('partners');
    } else if (tab === 'sponsors') {
      setActiveTab('sponsors');
    } else if (tab === 'videos') {
      setActiveTab('videos');
    } else {
      setActiveTab('news'); // Default to news tab
    }
  }, [location]);

  return (
    <div className="bg-retro-black min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* News Hero */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-pixel text-neon-purple mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            NEWS & UPDATES
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Stay updated with the latest news, partnership announcements, and videos from TeamWave.
          </motion.p>
        </div>

        {/* Tabs Navigation */}
        <motion.div 
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-wrap rounded-lg overflow-hidden neon-border">
            <button
              className={`px-8 py-3 font-arcade text-lg uppercase transition-colors duration-300 ${
                activeTab === 'news' ? 'bg-neon-purple text-white' : 'bg-dark-purple/50 text-gray-300 hover:bg-dark-purple'
              }`}
              onClick={() => setActiveTab('news')}
            >
              News
            </button>
            <button
              className={`px-8 py-3 font-arcade text-lg uppercase transition-colors duration-300 ${
                activeTab === 'partners' ? 'bg-neon-purple text-white' : 'bg-dark-purple/50 text-gray-300 hover:bg-dark-purple'
              }`}
              onClick={() => setActiveTab('partners')}
            >
              Partners
            </button>
            <button
              className={`px-8 py-3 font-arcade text-lg uppercase transition-colors duration-300 ${
                activeTab === 'sponsors' ? 'bg-neon-purple text-white' : 'bg-dark-purple/50 text-gray-300 hover:bg-dark-purple'
              }`}
              onClick={() => setActiveTab('sponsors')}
            >
              Sponsors
            </button>
            <button
              className={`px-8 py-3 font-arcade text-lg uppercase transition-colors duration-300 ${
                activeTab === 'videos' ? 'bg-neon-purple text-white' : 'bg-dark-purple/50 text-gray-300 hover:bg-dark-purple'
              }`}
              onClick={() => setActiveTab('videos')}
            >
              Videos
            </button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 bg-dark-purple/60 border-2 border-neon-purple rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors duration-300"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-3 top-4 text-neon-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* News Content */}
        {activeTab === 'news' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple mx-auto"></div>
                <p className="text-neon-purple font-pixel mt-4">Loading news...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-500/10 rounded-lg border border-red-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-lg mb-2">{error}</p>
                <div className="text-gray-400 text-sm mb-4">
                  <p>Possible solutions:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Make sure the backend server is running on port 5000</li>
                    <li>Check that MongoDB is connected and working properly</li>
                    <li>Ensure you've created the necessary database collections</li>
                  </ul>
                </div>
                <div className="mt-6 mb-6 border-t border-red-500/30 pt-4">
                  <h3 className="text-gray-300 mb-2">Debug Tools:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button 
                      onClick={() => window.open(`${config.apiUrl}/test/images`, '_blank')}
                      className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors"
                    >
                      Test Images API
                    </button>
                    <button 
                      onClick={() => window.open(`${config.apiUrl}/ensure-test-image`, '_blank')}
                      className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors"
                    >
                      Ensure Test Image
                    </button>
                    <button 
                      onClick={() => window.open(`${config.apiUrl.replace(/\/api$/, '')}/api/direct-test-image`, '_blank')}
                      className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors"
                    >
                      View Direct Test Image
                    </button>
                    <button 
                      onClick={() => window.open(`${config.apiUrl.replace(/\/api$/, '')}/uploads/test-image.jpg`, '_blank')}
                      className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-md transition-colors"
                    >
                      View Static Test Image
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink rounded-md transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map(article => (
                  <motion.div 
                    key={article._id}
                    className="arcade-card overflow-hidden flex flex-col h-full"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(138, 43, 226, 0.5)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <FallbackImage 
                      src={article.image} 
                      alt={article.title} 
                      className="w-full h-48 object-cover"
                      category={article.category}
                    />
                    <div className="p-6 flex flex-col flex-grow">
                      <span className={`text-xs font-pixel px-2 py-1 rounded mb-3 inline-block ${
                        article.category === 'announcement' ? 'bg-neon-blue/20 text-neon-blue' :
                        article.category === 'event' ? 'bg-neon-green/20 text-neon-green' :
                        article.category === 'team' ? 'bg-neon-purple/20 text-neon-purple' :
                        article.category === 'community' ? 'bg-neon-pink/20 text-neon-pink' :
                        'bg-neon-pink/20 text-neon-pink'
                      }`}>
                        {article.category.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-pixel text-white mb-2">{article.title}</h3>
                      <p className="text-gray-300 mb-4 flex-grow">{article.excerpt}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <span className="text-sm text-gray-400">{new Date(article.date).toLocaleDateString()}</span>
                        <Link 
                          to={`/article/${article._id}`}
                          className="text-neon-purple hover:text-neon-pink transition-colors duration-200 flex items-center"
                        >
                          Read More
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-20">
                <p className="text-2xl font-pixel">No news found matching your search.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Partners Content */}
        {activeTab === 'partners' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-gray-300">
                Our <span className="text-neon-blue font-semibold">partners</span> collaborate with TeamWave on product development, technology integration, and long-term strategic initiatives. These relationships focus on mutual growth and value creation through joint projects and services.
              </p>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-neon-blue mb-4 text-center">PLATINUM PARTNERS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.filter(p => p.tier && p.tier.toLowerCase() === 'platinum').map(partner => {
                  console.log('Partner logo debug:', {
                    name: partner.name,
                    logo: partner.logo,
                    processedUrl: partner.logo ? getPartnerImageUrl(partner.logo, partner.name) : 'no-logo'
                  });
                  return (
                    <motion.div 
                      key={partner._id}
                      className="arcade-card p-6 flex flex-col items-center border-neon-blue"
                      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 240, 255, 0.5)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={partner.logo ? getPartnerImageUrl(partner.logo, partner.name) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'}
                        alt={partner.name}
                        className="h-24 mb-4"
                        onError={e => { 
                          console.log('Image failed to load for:', partner.name, 'URL:', e.currentTarget.src);
                          e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; 
                        }}
                      />
                      <h3 className="text-xl font-pixel text-white mb-2">{partner.name}</h3>
                      <p className="text-gray-300 text-center mb-4">{partner.description}</p>
                      <div className="flex gap-3 mt-auto">
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="pixel-btn"
                        >
                          WEBSITE
                        </a>
                        <Link 
                          to={`/partner/${partner._id}`}
                          className="pixel-btn bg-neon-blue text-white hover:bg-neon-blue/80"
                        >
                          DETAILS
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-neon-pink mb-4 text-center">GOLD PARTNERS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.filter(p => p.tier && p.tier.toLowerCase() === 'gold').map(partner => (
                  <motion.div 
                    key={partner._id}
                    className="arcade-card p-6 flex flex-col items-center border-neon-pink"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(255, 0, 255, 0.5)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={partner.logo ? getPartnerImageUrl(partner.logo, partner.name) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'}
                      alt={partner.name}
                      className="h-20 mb-4"
                      onError={e => { e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; }}
                    />
                    <h3 className="text-xl font-pixel text-white mb-2">{partner.name}</h3>
                    <p className="text-gray-300 text-center mb-4">{partner.description}</p>
                    <div className="flex gap-3 mt-auto">
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="pixel-btn"
                      >
                        WEBSITE
                      </a>
                      <Link 
                        to={`/partner/${partner._id}`}
                        className="pixel-btn bg-neon-pink text-white hover:bg-neon-pink/80"
                      >
                        DETAILS
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-pixel text-neon-green mb-4 text-center">SILVER PARTNERS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {partners.filter(p => p.tier && p.tier.toLowerCase() === 'silver').map(partner => (
                  <motion.div 
                    key={partner._id}
                    className="arcade-card p-6 flex flex-col items-center border-neon-green"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 255, 0, 0.5)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={partner.logo ? getPartnerImageUrl(partner.logo, partner.name) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'}
                      alt={partner.name}
                      className="h-16 mb-4"
                      onError={e => { e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; }}
                    />
                    <h3 className="text-lg font-pixel text-white mb-2">{partner.name}</h3>
                    <p className="text-gray-300 text-center text-sm mb-4">{partner.description}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto w-full">
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-green hover:underline text-sm text-center"
                      >
                        Visit Website
                      </a>
                      <Link 
                        to={`/partner/${partner._id}`}
                        className="text-neon-green hover:underline text-sm text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center mt-16">
              <h2 className="text-2xl font-pixel text-white mb-6">INTERESTED IN BECOMING A PARTNER?</h2>
              <button className="pixel-btn bg-neon-purple hover:bg-white hover:text-dark-purple">
                CONTACT US
              </button>
            </div>
          </motion.div>
        )}

        {/* Sponsors Content */}
        {activeTab === 'sponsors' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto text-center mb-10">
              <p className="text-gray-300">
                Our <span className="text-yellow-400 font-semibold">sponsors</span> provide financial or in-kind support for TeamWave events, tournaments, and operations. They gain brand visibility while helping us deliver exceptional gaming experiences to our community.
              </p>
            </div>
            
            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-yellow-400 mb-4 text-center">OFFICIAL SPONSORS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.filter(s => s.tier && s.tier.toLowerCase() === 'official').map(sponsor => {
                  console.log('Sponsor logo debug:', {
                    name: sponsor.name,
                    logo: sponsor.logo,
                    processedUrl: sponsor.logo ? getPartnerImageUrl(sponsor.logo, sponsor.name) : 'no-logo'
                  });
                  return (
                    <motion.div 
                      key={sponsor._id}
                      className="arcade-card p-6 flex flex-col items-center border-yellow-400"
                      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(255, 215, 0, 0.5)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={sponsor.logo ? getPartnerImageUrl(sponsor.logo, sponsor.name) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'}
                        alt={sponsor.name}
                        className="h-24 mb-4"
                        onError={e => { 
                          console.log('Image failed to load for:', sponsor.name, 'URL:', e.currentTarget.src);
                          e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; 
                        }}
                      />
                      <h3 className="text-xl font-pixel text-white mb-2">{sponsor.name}</h3>
                      <p className="text-gray-300 text-center mb-4">{sponsor.description}</p>
                      <div className="flex gap-3 mt-auto">
                        <a 
                          href={sponsor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="pixel-btn bg-yellow-400/20 text-yellow-400 border-yellow-400"
                        >
                          WEBSITE
                        </a>
                        <Link 
                          to={`/sponsor/${sponsor._id}`}
                          className="pixel-btn bg-yellow-400 text-dark-purple hover:bg-yellow-400/80"
                        >
                          DETAILS
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-pixel text-orange-400 mb-4 text-center">MAJOR SPONSORS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.filter(s => s.tier && s.tier.toLowerCase() === 'major').map(sponsor => (
                  <motion.div 
                    key={sponsor._id}
                    className="arcade-card p-6 flex flex-col items-center border-orange-400"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(255, 165, 0, 0.5)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={sponsor.logo ? getPartnerImageUrl(sponsor.logo, sponsor.name) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'}
                      alt={sponsor.name}
                      className="h-20 mb-4"
                      onError={e => { e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; }}
                    />
                    <h3 className="text-xl font-pixel text-white mb-2">{sponsor.name}</h3>
                    <p className="text-gray-300 text-center mb-4">{sponsor.description}</p>
                    <div className="flex gap-3 mt-auto">
                      <a 
                        href={sponsor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="pixel-btn bg-orange-400/20 text-orange-400 border-orange-400"
                      >
                        WEBSITE
                      </a>
                      <Link 
                        to={`/sponsor/${sponsor._id}`}
                        className="pixel-btn bg-orange-400 text-dark-purple hover:bg-orange-400/80"
                      >
                        DETAILS
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-pixel text-neon-green mb-4 text-center">SUPPORTING SPONSORS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sponsors.filter(s => s.tier && s.tier.toLowerCase() === 'supporting').map(sponsor => (
                  <motion.div 
                    key={sponsor._id}
                    className="arcade-card p-6 flex flex-col items-center border-neon-green"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 255, 0, 0.5)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={sponsor.logo ? getPartnerImageUrl(sponsor.logo, sponsor.name) : 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'}
                      alt={sponsor.name}
                      className="h-16 mb-4"
                      onError={e => { e.currentTarget.src = 'https://placehold.co/200x120/1A0033/FFFFFF?text=LOGO'; }}
                    />
                    <h3 className="text-lg font-pixel text-white mb-2">{sponsor.name}</h3>
                    <p className="text-gray-300 text-center text-sm mb-4">{sponsor.description}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-auto w-full">
                      <a 
                        href={sponsor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neon-green hover:underline text-sm text-center"
                      >
                        Visit Website
                      </a>
                      <Link 
                        to={`/sponsor/${sponsor._id}`}
                        className="text-neon-green hover:underline text-sm text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="text-center mt-16">
              <h2 className="text-2xl font-pixel text-white mb-6">INTERESTED IN SPONSORING TEAMWAVE?</h2>
              <button className="pixel-btn bg-yellow-400 text-dark-purple hover:bg-white hover:text-dark-purple">
                BECOME A SPONSOR
              </button>
            </div>
          </motion.div>
        )}

        {/* Videos Content */}
        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredVideos.map(video => (
                  <motion.div 
                    key={video._id}
                    className="arcade-card overflow-hidden cursor-pointer"
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(138, 43, 226, 0.5)' }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      if (video.videoUrl) {
                        window.open(video.videoUrl, '_blank');
                      } else if (video.videoFile) {
                        window.open(videoService.getVideoUrl(video), '_blank');
                      }
                    }}
                  >
                    <div className="relative">
                      {video.thumbnailType === 'video' ? (
                        <video 
                          src={videoService.getThumbnailUrl(video.thumbnail)} 
                          className="w-full h-64 object-cover"
                          muted
                          loop
                          autoPlay
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            console.error('Video thumbnail failed to load:', video.thumbnail, 'URL:', videoService.getThumbnailUrl(video.thumbnail));
                            target.style.display = 'none';
                            // Show fallback image
                            const fallbackImg = document.createElement('img');
                            fallbackImg.src = 'https://placehold.co/400x300/1A0033/FFFFFF?text=No+Thumbnail';
                            fallbackImg.className = 'w-full h-64 object-cover';
                            target.parentNode?.appendChild(fallbackImg);
                          }}
                          onLoadStart={() => {
                            console.log('Video thumbnail loading:', video.thumbnail, 'URL:', videoService.getThumbnailUrl(video.thumbnail));
                          }}
                        />
                      ) : (
                        <img 
                          src={videoService.getThumbnailUrl(video.thumbnail)} 
                          alt={video.title} 
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.error('Thumbnail failed to load:', video.thumbnail, 'URL:', videoService.getThumbnailUrl(video.thumbnail));
                            target.src = 'https://placehold.co/400x300/1A0033/FFFFFF?text=No+Thumbnail';
                          }}
                          onLoad={() => {
                            console.log('Thumbnail loaded successfully:', video.thumbnail, 'URL:', videoService.getThumbnailUrl(video.thumbnail));
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-dark-purple/50 flex items-center justify-center">
                        <button className="w-16 h-16 bg-neon-purple/80 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <span className={`text-xs font-pixel px-2 py-1 rounded mb-3 inline-block ${
                        video.category === 'gameplay' ? 'bg-neon-blue/20 text-neon-blue' :
                        video.category === 'tournament' ? 'bg-neon-green/20 text-neon-green' :
                        video.category === 'interview' ? 'bg-neon-purple/20 text-neon-purple' :
                        video.category === 'highlights' ? 'bg-neon-pink/20 text-neon-pink' :
                        video.category === 'tutorial' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {video.category.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-pixel text-white mb-2">
                        <SafeText>{video.title}</SafeText>
                      </h3>
                      <p className="text-gray-300 mb-4">
                        <SafeText>{video.description}</SafeText>
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'No date'}
                        </span>
                        <button className="text-neon-purple hover:text-neon-pink transition-colors duration-200">
                          Watch Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-20">
                <p className="text-2xl font-pixel">No videos found matching your search.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsPage; 