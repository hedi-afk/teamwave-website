import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FallbackImage from '../ui/FallbackImage';

interface ArticleDetailModalProps {
  article: {
    id: number;
    title: string;
    content: string;
    image: string;
    date: string;
    author: string;
    category: 'announcement' | 'event' | 'team' | 'community' | 'partnership';
  };
  onClose: () => void;
}

const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
  // Format date
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  // Close when clicking outside the modal content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <motion.div 
          className="w-full max-w-4xl max-h-screen overflow-auto bg-dark-purple rounded-lg arcade-card border-neon-purple"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Header with close button */}
          <div className="sticky top-0 bg-dark-purple border-b border-neon-purple/30 flex justify-between items-center p-4 z-10">
            <span className={`px-3 py-1 rounded text-xs font-pixel ${
              article.category === 'announcement' ? 'bg-neon-blue/20 text-neon-blue' :
              article.category === 'event' ? 'bg-neon-green/20 text-neon-green' :
              article.category === 'team' ? 'bg-neon-purple/20 text-neon-purple' :
              article.category === 'community' ? 'bg-neon-pink/20 text-neon-pink' :
              'bg-neon-pink/20 text-neon-pink'
            }`}>
              {article.category.toUpperCase()}
            </span>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-dark-purple/50 hover:bg-dark-purple rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Article image */}
          <div className="w-full h-72 overflow-hidden">
            <FallbackImage 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
              category={article.category}
            />
          </div>
          
          {/* Article content */}
          <div className="p-6">
            <h1 className="text-3xl font-pixel text-white mb-4">{article.title}</h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-gray-400">
                <span className="inline-block mr-2">By {article.author}</span>
                <span>•</span>
                <span className="inline-block ml-2">{formattedDate}</span>
              </div>
            </div>
            
            <div className="prose prose-lg prose-invert max-w-none">
              {/* Parse content as HTML if it contains HTML tags, otherwise display as plain text */}
              {article.content.includes('<') && article.content.includes('>') ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                article.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                ))
              )}
            </div>
          </div>
          
          {/* Footer with social sharing */}
          <div className="border-t border-neon-purple/30 p-4 flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              Share this article
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-blue-400 hover:bg-blue-500 text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </button>
              <button className="p-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ArticleDetailModal; 