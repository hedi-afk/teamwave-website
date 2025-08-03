import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import newsService, { INewsArticle } from '../../services/newsService';
import uploadService from '../../services/uploadService';
import ArticleEditorModal from '../../components/news/ArticleEditorModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import config from '../../config';
import FallbackImage from '../../components/ui/FallbackImage';
import ArticleDetailModal from '../../components/news/ArticleDetailModal';

const NewsPage: React.FC = () => {
  // State for news articles
  const [newsArticles, setNewsArticles] = useState<INewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtering state
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<INewsArticle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<INewsArticle | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch news articles from the API
  useEffect(() => {
    fetchNewsArticles();
  }, []);

  const fetchNewsArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching news articles from API:', config.apiUrl);
      
      const data = await newsService.getAllArticles();
      console.log('News articles fetched successfully:', data);
      
      setNewsArticles(data);
    } catch (err: any) {
      console.error('Error fetching news articles:', err);
      
      // Handle different error types
      if (err.response) {
        // The request was made and the server responded with a status code outside the 2xx range
        console.error('Response error data:', err.response.data);
        console.error('Response error status:', err.response.status);
        setError(`Server error: ${err.response.status}. ${err.response.data?.message || 'Please try again later.'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('Could not connect to the server. Please check your network connection.');
      } else {
        // Something happened in setting up the request
        setError(`Error: ${err.message || 'An unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter articles based on selected category
  const filteredArticles = activeFilter === 'all' 
    ? newsArticles 
    : newsArticles.filter(article => {
        // Convert to lowercase for case-insensitive comparison
        const articleCategory = article.category.toLowerCase();
        const filter = activeFilter.toLowerCase();
        
        // Check if category contains the filter (for partial matches)
        return articleCategory.includes(filter);
      });

  // Show success message for a few seconds
  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 5000);
  };

  // Add or update an article
  const handleSaveArticle = async (articleData: INewsArticle) => {
    try {
      setIsSubmitting(true);
      
      if (articleData._id) {
        // Update existing article
        await newsService.updateArticle(articleData._id, articleData);
        showSuccessMessage(`Article "${articleData.title}" updated successfully!`);
      } else {
        // Create new article
        await newsService.createArticle(articleData);
        showSuccessMessage(`Article "${articleData.title}" created successfully!`);
      }
      
      // Refresh the list
      await fetchNewsArticles();
      
      // Close the modal
      setShowAddModal(false);
      setShowEditModal(false);
      setCurrentArticle(null);
    } catch (err: any) {
      console.error('Error saving article:', err);
      setError(`Failed to save article: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an article
  const handleDeleteArticle = async () => {
    if (!currentArticle || !currentArticle._id) return;
    
    try {
      setIsSubmitting(true);
      await newsService.deleteArticle(currentArticle._id);
      showSuccessMessage(`Article "${currentArticle.title}" deleted successfully!`);
      
      // Refresh the list
      await fetchNewsArticles();
      
      // Close the modal
      setShowDeleteModal(false);
      setCurrentArticle(null);
    } catch (err: any) {
      console.error('Error deleting article:', err);
      setError(`Failed to delete article: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle article published status
  const handleTogglePublish = async (article: INewsArticle) => {
    if (!article._id) return;
    
    try {
      const newStatus = !article.published;
      await newsService.togglePublishStatus(article._id, newStatus);
      
      // Update local state
      setNewsArticles(prevArticles => 
        prevArticles.map(a => 
          a._id === article._id ? { ...a, published: newStatus } : a
        )
      );
      
      showSuccessMessage(`Article "${article.title}" ${newStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (err: any) {
      console.error('Error toggling publish status:', err);
      setError(`Failed to update publish status: ${err.message || 'Unknown error'}`);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get image URL
  const getImageUrl = (imagePath: string) => {
    return uploadService.getImageUrl(imagePath);
  };

  // Helper function to get the CSS class for a category
  const getCategoryClass = (category: string): string => {
    switch (category) {
      case 'team':
        return 'bg-neon-blue/20 text-neon-blue';
      case 'event':
        return 'bg-neon-green/20 text-neon-green';
      case 'partnership':
        return 'bg-neon-pink/20 text-neon-pink';
      case 'announcement':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'community':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Add a function to handle Preview button click
  const handlePreviewArticle = (article: INewsArticle) => {
    setPreviewArticle(article);
    setShowPreviewModal(true);
  };

  return (
    <div className="min-h-screen bg-retro-black">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-purple">News & Updates</h1>
          <button
            onClick={() => {
              setCurrentArticle(null);
              setShowAddModal(true);
            }}
            className="bg-neon-purple text-white px-4 py-2 rounded-md hover:bg-neon-purple/90 transition-colors"
          >
            Add News Article
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
            
            <div className="mt-4 text-sm">
              <h4 className="font-semibold">Possible solutions:</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Make sure the backend server is running on <code className="bg-dark-purple px-1 rounded">localhost:5000</code></li>
                <li>Check browser console for more detailed error information</li>
                <li>Verify that <code className="bg-dark-purple px-1 rounded">/api/news</code> endpoints are configured correctly in the backend</li>
                <li>Try using the <a href="/admin/api-test" className="text-blue-400 hover:underline">API Test</a> page to debug connection issues</li>
              </ul>
            </div>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-white p-4 rounded-md mb-4">
            <p>{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-purple/40'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'team' 
                  ? 'bg-neon-blue text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-blue/40'
              }`}
              onClick={() => setActiveFilter('team')}
            >
              Team
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'event' 
                  ? 'bg-neon-green text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-green/40'
              }`}
              onClick={() => setActiveFilter('event')}
            >
              Event
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'partnership' 
                  ? 'bg-neon-pink text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-neon-pink/40'
              }`}
              onClick={() => setActiveFilter('partnership')}
            >
              Partnership
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'announcement' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-yellow-500/40'
              }`}
              onClick={() => setActiveFilter('announcement')}
            >
              Announcement
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === 'community' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-dark-purple-light text-gray-300 hover:bg-purple-500/40'
              }`}
              onClick={() => setActiveFilter('community')}
            >
              Community
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
          </div>
        )}

        {/* Articles Table */}
        {!loading && newsArticles.length === 0 ? (
          <div className="bg-dark-purple-light rounded-lg border border-neon-purple/20 p-8 text-center">
            <p className="text-white">No news articles found. Create your first article!</p>
          </div>
        ) : (
          <div className="bg-dark-purple-light rounded-lg border border-neon-purple/20 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-purple/20 bg-dark-purple/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Author</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neon-purple/20">
                  {filteredArticles.map((article, index) => (
                    <tr key={article._id} className={index % 2 === 0 ? 'bg-dark-purple/30' : 'bg-transparent'}>
                      <td className="p-2">
                        <div className="w-12 h-12 overflow-hidden rounded">
                          <FallbackImage 
                            src={uploadService.getImageUrl(article.image)} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            category={article.category}
                          />
                        </div>
                      </td>
                      <td className="p-2">{article.title}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${getCategoryClass(article.category)}`}>
                          {article.category}
                        </span>
                      </td>
                      <td className="p-2">{article.author}</td>
                      <td className="p-2">{formatDate(article.date)}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleTogglePublish(article)}
                          className={`px-2 py-1 rounded-full text-xs ${article.published ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                        >
                          {article.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="p-2 flex gap-2">
                        <Link 
                          to={`/article/${article._id}`}
                          target="_blank"
                          className="text-green-400 hover:text-green-300"
                        >
                          View
                        </Link>
                        <button 
                          onClick={() => handlePreviewArticle(article)}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          Preview
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentArticle(article);
                            setShowEditModal(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentArticle(article);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Article Modal */}
        {(showAddModal || showEditModal) && (
          <ArticleEditorModal
            onClose={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setCurrentArticle(null);
            }}
            onSave={handleSaveArticle}
            article={currentArticle}
            isLoading={isSubmitting}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && currentArticle && (
          <ConfirmDialog
            title="Delete Article"
            message={`Are you sure you want to delete the article "${currentArticle.title}"? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDeleteArticle}
            onCancel={() => {
              setShowDeleteModal(false);
              setCurrentArticle(null);
            }}
            isLoading={isSubmitting}
            type="danger"
          />
        )}

        {/* Article Detail Modal */}
        {showPreviewModal && previewArticle && (
          <ArticleDetailModal 
            article={{
              id: parseInt(previewArticle._id?.substring(0, 8) || '0', 16), 
              title: previewArticle.title,
              content: previewArticle.content,
              image: uploadService.getImageUrl(previewArticle.image),
              date: typeof previewArticle.date === 'string' ? previewArticle.date : previewArticle.date.toISOString(),
              author: previewArticle.author,
              category: previewArticle.category as 'announcement' | 'event' | 'team' | 'community' | 'partnership'
            }}
            onClose={() => setShowPreviewModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default NewsPage; 