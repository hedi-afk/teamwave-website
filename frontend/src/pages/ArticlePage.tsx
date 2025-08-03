import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import newsService, { INewsArticle } from '../services/newsService';
import uploadService from '../services/uploadService';
import FallbackImage from '../components/ui/FallbackImage';

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<INewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const imageCache = useRef<Record<string, string>>({});
  
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setError('Article ID is missing');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(`Attempting to fetch article with ID: ${id}`);
        
        // Try to get the article by ID directly
        const data = await newsService.getArticleById(id);
        
        if (!data) {
          setError('Article not found');
          setDebugInfo(`No article found with ID: ${id}`);
        } else {
          setArticle(data);
          setDebugInfo(`Successfully loaded article: ${data.title}`);
        }
      } catch (err: any) {
        console.error('Error fetching article:', err);
        let errorMessage = 'Could not load the article. Please try again later.';
        
        // Provide more specific error information
        if (err.response) {
          errorMessage = `Server error: ${err.response.status}. ${err.response.data?.message || 'Please try again later.'}`;
          setDebugInfo(`Response status: ${err.response.status}, data: ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          errorMessage = 'Could not connect to the server. Please check your network connection.';
          setDebugInfo('No response received from server');
        } else {
          setDebugInfo(`Error message: ${err.message}`);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [id]);
  
  // Format date with useCallback
  const formatDate = useCallback((dateString?: string | Date) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);
  
  // Get image URL with proper handling and caching
  const getImageUrl = useCallback((imagePath?: string) => {
    if (!imagePath) return '';
    
    // Check cache first
    if (imageCache.current[imagePath]) {
      return imageCache.current[imagePath];
    }
    
    try {
      const url = uploadService.getImageUrl(imagePath);
      // Store in cache
      imageCache.current[imagePath] = url;
      return url;
    } catch (err) {
      console.error('Error getting image URL:', err);
      return '';
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
              <h2 className="text-2xl font-pixel text-white mb-4">Article Not Found</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              {debugInfo && (
                <div className="mb-6 text-xs text-left bg-black/30 p-3 rounded overflow-auto max-h-40">
                  <p className="text-gray-400 mb-1">Debug Info:</p>
                  <pre className="text-gray-500 whitespace-pre-wrap">{debugInfo}</pre>
                </div>
              )}
              <Link to="/forum" className="pixel-btn bg-neon-purple hover:bg-neon-pink transition-colors">
                Back to News
              </Link>
            </motion.div>
          </div>
        ) : article ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Back to News link */}
            <div className="mb-6">
              <Link to="/forum" className="inline-flex items-center text-neon-purple hover:text-neon-pink transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to News
              </Link>
            </div>
            
            {/* Category badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded text-xs font-pixel ${
                article.category === 'announcement' ? 'bg-neon-blue/20 text-neon-blue' :
                article.category === 'event' ? 'bg-neon-green/20 text-neon-green' :
                article.category === 'team' ? 'bg-neon-purple/20 text-neon-purple' :
                article.category === 'community' ? 'bg-neon-pink/20 text-neon-pink' :
                'bg-neon-pink/20 text-neon-pink'
              }`}>
                {article.category.toUpperCase()}
              </span>
            </div>
            
            {/* Article title */}
            <h1 className="text-4xl font-pixel text-white mb-6">{article.title}</h1>
            
            {/* Author and date */}
            <div className="flex items-center text-gray-400 mb-8">
              <span className="inline-block mr-2">By {article.author}</span>
              <span>•</span>
              <span className="inline-block ml-2">{formatDate(article.date)}</span>
            </div>
            
            {/* Featured image */}
            <div className="rounded-lg overflow-hidden mb-8 arcade-card p-2">
              <FallbackImage 
                src={getImageUrl(article.image)} 
                alt={article.title} 
                className="w-full max-h-96 object-cover rounded"
                category={article.category as any}
              />
            </div>
            
            {/* Article content */}
            <div className="prose prose-lg prose-invert max-w-none bg-dark-purple/20 rounded-lg p-8 arcade-card">
              {/* Parse content as HTML if it contains HTML tags, otherwise display as plain text */}
              {article.content.includes('<') && article.content.includes('>') ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                article.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default ArticlePage; 