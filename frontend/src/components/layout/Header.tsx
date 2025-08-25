import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { getShopSettings } from '../../services/shopSettingsService';

// Define menu items with their associated colors
const menuItems = [
  { path: '/', text: 'HOME', color: 'neon-pink' },
  { path: '/members', text: 'MEMBERS', color: 'neon-blue' },
  { path: '/events', text: 'EVENTS', color: 'neon-green' },
  { path: '/shop', text: 'SHOP', color: 'neon-yellow' },
  { path: '/forum', text: 'NEWS', color: 'neon-purple' },
  { path: '/contact', text: 'CONTACT', color: 'neon-cyan' },
];

const Header: React.FC = () => {
  const { darkMode } = useTheme();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [shopSettings, setShopSettings] = useState<any>(null);
  const location = useLocation();

  // Fetch shop settings on component mount
  useEffect(() => {
    const fetchShopSettings = async () => {
      try {
        const settings = await getShopSettings();
        setShopSettings(settings);
      } catch (error) {
        console.error('Error fetching shop settings:', error);
      }
    };
    fetchShopSettings();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const getItemColor = (color: string) => {
    switch (color) {
      case 'neon-pink': return 'text-neon-pink border-neon-pink';
      case 'neon-blue': return 'text-neon-blue border-neon-blue';
      case 'neon-green': return 'text-neon-green border-neon-green';
      case 'neon-yellow': return 'text-yellow-400 border-yellow-400';
      case 'neon-purple': return 'text-neon-purple border-neon-purple';
      case 'neon-cyan': return 'text-cyan-400 border-cyan-400';
      default: return 'text-white border-transparent';
    }
  };

  const getHoverColor = (color: string) => {
    switch (color) {
      case 'neon-pink': return 'hover:text-neon-pink hover:border-neon-pink/50';
      case 'neon-blue': return 'hover:text-neon-blue hover:border-neon-blue/50';
      case 'neon-green': return 'hover:text-neon-green hover:border-neon-green/50';
      case 'neon-yellow': return 'hover:text-yellow-400 hover:border-yellow-400/50';
      case 'neon-purple': return 'hover:text-neon-purple hover:border-neon-purple/50';
      case 'neon-cyan': return 'hover:text-cyan-400 hover:border-cyan-400/50';
      default: return 'hover:text-white hover:border-transparent';
    }
  };

  const getHoverBgColor = (color: string) => {
    switch (color) {
      case 'neon-pink': return 'hover:bg-neon-pink/5';
      case 'neon-blue': return 'hover:bg-neon-blue/5';
      case 'neon-green': return 'hover:bg-neon-green/5';
      case 'neon-yellow': return 'hover:bg-yellow-400/5';
      case 'neon-purple': return 'hover:bg-neon-purple/5';
      case 'neon-cyan': return 'hover:bg-cyan-400/5';
      default: return '';
    }
  };

  const getActiveBgColor = (color: string) => {
    switch (color) {
      case 'neon-pink': return 'bg-neon-pink/10';
      case 'neon-blue': return 'bg-neon-blue/10';
      case 'neon-green': return 'bg-neon-green/10';
      case 'neon-yellow': return 'bg-yellow-400/10';
      case 'neon-purple': return 'bg-neon-purple/10';
      case 'neon-cyan': return 'bg-cyan-400/10';
      default: return '';
    }
  };

  return (
    <header className="fixed w-full bg-dark-purple/80 backdrop-blur-sm z-50 border-b-2 border-neon-purple">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <span className="text-2xl font-pixel tracking-wider relative text-glitch-effect">
            <span className="text-neon-pink animate-pulse-slow relative z-10 group-hover:animate-none transition-all duration-300">
              TEAM
              <span className="absolute inset-0 bg-neon-pink/20 blur-md -z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
            </span>
            <span className="text-neon-blue animate-pulse-slow animation-delay-500 relative z-10 group-hover:animate-none transition-all duration-300">
              WAVE
              <span className="absolute inset-0 bg-neon-blue/20 blur-md -z-10 opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
            </span>
            <span className="absolute -inset-1 bg-gradient-to-r from-neon-pink/0 via-neon-blue/0 to-neon-purple/0 group-hover:from-neon-pink/30 group-hover:via-neon-blue/20 group-hover:to-neon-purple/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></span>
          </span>
        </Link>

        {/* Cart indicator */}
        {totalItems > 0 && shopSettings && shopSettings.isActive && (
          <Link 
            to="/shop" 
            className="relative mr-4 text-neon-yellow hover:text-yellow-300 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-neon-pink text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {totalItems}
            </span>
          </Link>
        )}

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          {totalItems > 0 && shopSettings && shopSettings.isActive && (
            <Link 
              to="/shop" 
              className="relative text-neon-yellow hover:text-yellow-300 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-neon-pink text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            </Link>
          )}
          <button 
            className="text-white p-1"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems
            .filter(item => !(item.path === '/shop' && shopSettings && !shopSettings.isActive))
            .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative text-sm font-pixel tracking-wider py-2 px-3 border-b-2 transition-all duration-300 ${
                isActive(item.path)
                  ? getItemColor(item.color)
                  : `text-white border-transparent ${getHoverColor(item.color)}`
              }`}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.text}
              {hoveredItem === item.path && !isActive(item.path) && (
                <span 
                  className={`absolute inset-0 -z-10 opacity-70 blur-md transition-opacity duration-300 ${
                    item.color === 'neon-pink' ? 'bg-neon-pink/20' :
                    item.color === 'neon-blue' ? 'bg-neon-blue/20' :
                    item.color === 'neon-green' ? 'bg-neon-green/20' :
                    item.color === 'neon-yellow' ? 'bg-yellow-400/20' :
                    item.color === 'neon-purple' ? 'bg-neon-purple/20' :
                    'bg-cyan-400/20'
                  }`}
                ></span>
              )}
              {isActive(item.path) && (
                <span 
                  className={`absolute inset-0 -z-10 opacity-70 blur-md ${
                    item.color === 'neon-pink' ? 'bg-neon-pink/30' :
                    item.color === 'neon-blue' ? 'bg-neon-blue/30' :
                    item.color === 'neon-green' ? 'bg-neon-green/30' :
                    item.color === 'neon-yellow' ? 'bg-yellow-400/30' :
                    item.color === 'neon-purple' ? 'bg-neon-purple/30' :
                    'bg-cyan-400/30'
                  }`}
                ></span>
              )}
            </Link>
          ))}
        </nav>
      </div>

              {/* Mobile menu (conditional rendering) */}
        {isMenuOpen && (
          <div className="md:hidden bg-dark-purple/95 border-t border-neon-purple animate-[fadeIn_0.3s_ease-in-out]">
            <div className="flex flex-col px-4 pt-2 pb-4 space-y-2">
              {menuItems
                .filter(item => !(item.path === '/shop' && shopSettings && !shopSettings.isActive))
                .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-pixel text-sm tracking-wider py-3 px-4 border-l-4 transition-all duration-300 ${
                  isActive(item.path)
                    ? `${getItemColor(item.color)} ${getActiveBgColor(item.color)}`
                    : `text-white border-transparent ${getHoverColor(item.color)} ${getHoverBgColor(item.color)}`
                }`}
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {item.text}
                {hoveredItem === item.path && !isActive(item.path) && (
                  <span 
                    className={`absolute inset-0 -z-10 opacity-30 transition-opacity duration-300 ${
                      item.color === 'neon-pink' ? 'bg-neon-pink/10' :
                      item.color === 'neon-blue' ? 'bg-neon-blue/10' :
                      item.color === 'neon-green' ? 'bg-neon-green/10' :
                      item.color === 'neon-yellow' ? 'bg-yellow-400/10' :
                      item.color === 'neon-purple' ? 'bg-neon-purple/10' :
                      'bg-cyan-400/10'
                    }`}
                  ></span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 