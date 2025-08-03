// Configuration file for the frontend application

// Base API configuration - use environment variables for deployment
const API_PORT = process.env.REACT_APP_API_PORT || 5000;
const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PROTOCOL = process.env.REACT_APP_API_PROTOCOL || 'http';
const API_BASE_PATH = '/api';

// Build the API URL from components
const baseApiUrl = `${API_PROTOCOL}://${API_HOST}:${API_PORT}${API_BASE_PATH}`;
const baseUploadUrl = `${API_PROTOCOL}://${API_HOST}:${API_PORT}/uploads/`;

const config = {
  // API endpoint
  apiUrl: baseApiUrl,
  
  // Image base URL
  imageBaseUrl: baseUploadUrl,
  
  // Other settings
  defaultGame: 'CS:GO',
  
  // Social media links
  social: {
    twitter: 'https://twitter.com/teamwave',
    instagram: 'https://instagram.com/teamwave',
    twitch: 'https://twitch.tv/teamwave',
    discord: 'https://discord.gg/teamwave',
    youtube: 'https://youtube.com/c/teamwave'
  },

  defaultGameImage: 'https://placehold.co/600x400/1A0033/00FFFF?text=GAME',

  siteTitle: 'TeamWave',
  siteDescription: 'Professional esports organization',
  siteLogo: '/images/logo.png',
  defaultAvatar: 'https://placehold.co/100/8A2BE2/FFFFFF?text=TW'
};

export default config; 