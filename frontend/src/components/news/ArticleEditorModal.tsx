import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RichTextEditor from '../ui/RichTextEditor';
import ImageUploader from '../ui/ImageUploader';
import { INewsArticle } from '../../services/newsService';

interface ArticleEditorModalProps {
  onClose: () => void;
  onSave: (articleData: INewsArticle) => void;
  article?: INewsArticle | null;
  isLoading?: boolean;
}

const defaultArticle: INewsArticle = {
  title: '',
  content: '',
  excerpt: '',
  image: '',
  date: new Date().toISOString().split('T')[0],
  category: 'announcement',
  author: 'Admin',
  published: false
};

const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  onClose,
  onSave,
  article = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<INewsArticle>(defaultArticle);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form with existing article data if provided
  useEffect(() => {
    if (article) {
      // Format the date to YYYY-MM-DD for the date input
      const formattedDate = article.date instanceof Date 
        ? article.date.toISOString().split('T')[0]
        : (typeof article.date === 'string' 
          ? new Date(article.date).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0]);

      setFormData({
        ...article,
        date: formattedDate
      });
    }
  }, [article]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));

    // Clear error for content
    if (formErrors.content) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.content;
        return newErrors;
      });
    }
  };

  const handleImageUpload = (imagePath: string) => {
    setFormData(prev => ({
      ...prev,
      image: imagePath
    }));

    // Clear error for image
    if (formErrors.image) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (!formData.image) {
      errors.image = 'Featured image is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-purple-light p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neon-purple">
            {article ? 'Edit Article' : 'Add New Article'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-dark-purple border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50 ${
                formErrors.title ? 'border-red-500' : 'border-neon-purple/30'
              }`}
              disabled={isLoading}
            />
            {formErrors.title && (
              <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
                disabled={isLoading}
              >
                <option value="announcement">Announcement</option>
                <option value="event">Event</option>
                <option value="team">Team</option>
                <option value="partnership">Partnership</option>
                <option value="community">Community</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Date*
              </label>
              <input
                type="date"
                name="date"
                value={typeof formData.date === 'string' ? formData.date : formData.date.toISOString().split('T')[0]}
                onChange={handleChange}
                className={`w-full px-4 py-2 bg-dark-purple border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50 ${
                  formErrors.date ? 'border-red-500' : 'border-neon-purple/30'
                }`}
                disabled={isLoading}
              />
              {formErrors.date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Excerpt (Short summary)*
            </label>
            <input
              type="text"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-dark-purple border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-purple/50 ${
                formErrors.excerpt ? 'border-red-500' : 'border-neon-purple/30'
              }`}
              placeholder="Brief summary of the article (displayed in cards)"
              maxLength={150}
              disabled={isLoading}
            />
            {formErrors.excerpt && (
              <p className="text-red-500 text-xs mt-1">{formErrors.excerpt}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.excerpt.length}/150 characters
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Content*
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your article content here..."
              minHeight="300px"
            />
            {formErrors.content && (
              <p className="text-red-500 text-xs mt-1">{formErrors.content}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Featured Image*
            </label>
            <ImageUploader
              onImageUpload={handleImageUpload}
              existingImage={formData.image}
              uploadType="news"
              className={formErrors.image ? 'border-red-500' : ''}
            />
            {formErrors.image && (
              <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-neon-purple focus:ring-neon-purple border-gray-600 rounded bg-dark-purple"
              disabled={isLoading}
            />
            <label htmlFor="published" className="ml-2 text-sm text-white">
              Publish immediately
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-neon-purple/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-dark-purple text-white rounded-md hover:bg-dark-purple-light transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-purple/90 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {article ? 'Update Article' : 'Save Article'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ArticleEditorModal; 