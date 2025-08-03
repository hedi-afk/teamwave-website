import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../config';

interface RegistrationFormProps {
  eventId: string;
  eventName: string;
  game: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  eventId, 
  eventName, 
  game, 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    gameName: '',
    gameId: '',
    team: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.apiUrl}/registrations`, {
        eventId,
        ...formData
      });

      setSuccess(true);
      setLoading(false);
      
      // Wait a bit before calling onSuccess
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error: any) {
      setLoading(false);
      if (error.response && error.response.data) {
        setError(error.response.data.message || 'Something went wrong. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    }
  };

  if (success) {
    return (
      <motion.div 
        className="arcade-card p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-5xl mb-4">🎮</div>
        <h2 className="text-2xl font-pixel text-neon-green mb-4">Registration Successful!</h2>
        <p className="text-gray-300 mb-6">
          Thank you for registering for {eventName}. We'll contact you with further details soon.
        </p>
        <button 
          className="pixel-btn bg-neon-blue text-white"
          onClick={onSuccess}
        >
          CLOSE
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="arcade-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-pixel text-neon-blue">REGISTER FOR EVENT</h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-neon-pink p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-neon-green font-arcade mb-1 text-sm sm:text-base">{eventName}</h3>
          <p className="text-gray-400 text-xs sm:text-sm">Game: {game}</p>
        </div>

        {error && (
          <div className="bg-neon-red/10 border border-neon-red text-neon-red px-3 sm:px-4 py-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-1 text-sm">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-300 mb-1 text-sm">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-gray-300 mb-1 text-sm">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="gameName" className="block text-gray-300 mb-1 text-sm">In-Game Name *</label>
              <input
                type="text"
                id="gameName"
                name="gameName"
                value={formData.gameName}
                onChange={handleChange}
                required
                className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label htmlFor="gameId" className="block text-gray-300 mb-1 text-sm">Game ID/Account (optional)</label>
              <input
                type="text"
                id="gameId"
                name="gameId"
                value={formData.gameId}
                onChange={handleChange}
                className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="team" className="block text-gray-300 mb-1 text-sm">Team Name (optional)</label>
              <input
                type="text"
                id="team"
                name="team"
                value={formData.team}
                onChange={handleChange}
                className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-gray-300 mb-1 text-sm">Additional Information (optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full bg-dark-purple border-2 border-neon-purple px-3 sm:px-4 py-2 rounded text-white focus:outline-none focus:border-neon-pink text-sm"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-0">
            <button
              type="button"
              onClick={onCancel}
              className="pixel-btn bg-gray-700 text-white hover:bg-gray-600 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto"
              disabled={loading}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="pixel-btn bg-neon-green text-retro-black text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT REGISTRATION'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default RegistrationForm; 