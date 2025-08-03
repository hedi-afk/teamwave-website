import React from 'react';

interface NewsPlaceholderProps {
  category?: 'announcement' | 'event' | 'team' | 'community' | 'partnership';
  className?: string;
}

/**
 * A styled placeholder component for news articles when images fail to load
 */
const NewsPlaceholder: React.FC<NewsPlaceholderProps> = ({
  category = 'announcement',
  className = '',
}) => {
  // Define colors based on category
  const colors = {
    announcement: {
      bg: '#1A0033',
      accent: '#00FFFF',
      text: '#FFFFFF',
    },
    event: {
      bg: '#1A0033',
      accent: '#00FF00',
      text: '#FFFFFF',
    },
    team: {
      bg: '#1A0033',
      accent: '#8A2BE2',
      text: '#FFFFFF',
    }, 
    partnership: {
      bg: '#1A0033',
      accent: '#FF00FF',
      text: '#FFFFFF',
    },
    community: {
      bg: '#1A0033',
      accent: '#FF1493',
      text: '#FFFFFF',
    },
  };

  const { bg, accent, text } = colors[category];

  return (
    <div 
      className={`w-full h-full flex items-center justify-center bg-dark-purple ${className}`}
      style={{ backgroundColor: bg }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 400" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid pattern */}
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path 
              d="M 20 0 L 0 0 0 20" 
              fill="none" 
              stroke={accent} 
              strokeWidth="0.5" 
              strokeOpacity="0.2"
            />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path 
              d="M 100 0 L 0 0 0 100" 
              fill="none" 
              stroke={accent} 
              strokeWidth="1" 
              strokeOpacity="0.2"
            />
          </pattern>
        </defs>

        {/* Main background with grid */}
        <rect width="100%" height="100%" fill={bg} />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Main content */}
        <g transform="translate(400, 200)">
          {/* Glowing center circle */}
          <circle 
            r="80" 
            fill={bg} 
            stroke={accent} 
            strokeWidth="2"
            opacity="0.9"
          />
          <circle 
            r="70" 
            fill="none" 
            stroke={accent} 
            strokeWidth="2"
            opacity="0.7"
          />
          
          {/* Category-specific icon */}
          {category === 'announcement' && (
            <g>
              <polygon 
                points="0,-40 30,20 -30,20" 
                fill="none"
                stroke={accent} 
                strokeWidth="3"
              />
              <circle cx="0" cy="0" r="10" fill={accent} />
            </g>
          )}
          
          {category === 'event' && (
            <g>
              <rect 
                x="-30" y="-30" 
                width="60" height="60" 
                fill="none"
                stroke={accent} 
                strokeWidth="3"
                rx="5" ry="5"
              />
              <path
                d="M -20 -5 L -5 10 L 10 -15 L 25 0"
                stroke={accent}
                strokeWidth="3"
                fill="none"
              />
            </g>
          )}
          
          {category === 'team' && (
            <g>
              <circle cx="-20" cy="-10" r="12" fill={accent} opacity="0.8" />
              <circle cx="0" cy="-20" r="12" fill={accent} opacity="0.9" />
              <circle cx="20" cy="-10" r="12" fill={accent} opacity="0.8" />
              <circle cx="-25" cy="15" r="12" fill={accent} opacity="0.7" />
              <circle cx="0" cy="20" r="12" fill={accent} opacity="0.8" />
              <circle cx="25" cy="15" r="12" fill={accent} opacity="0.7" />
            </g>
          )}
          
          {category === 'partnership' && (
            <g>
              <circle cx="-20" cy="0" r="20" fill="none" stroke={accent} strokeWidth="3" />
              <circle cx="20" cy="0" r="20" fill="none" stroke={accent} strokeWidth="3" />
            </g>
          )}
          
          {category === 'community' && (
            <g>
              <path
                d="M 0 -30 A 30 30 0 1 0 0 30 A 30 30 0 1 0 0 -30"
                fill="none"
                stroke={accent}
                strokeWidth="3"
              />
              <circle cx="0" cy="0" r="10" fill={accent} />
            </g>
          )}
        </g>
        
        {/* TeamWave Text */}
        <text
          x="50%" y="75%"
          fontSize="24"
          fontFamily="monospace"
          fontWeight="bold"
          fill={text}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {category.toUpperCase()}
        </text>
        
        <text
          x="50%" y="85%"
          fontSize="32"
          fontFamily="monospace"
          fontWeight="bold"
          fill={accent}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          TEAMWAVE
        </text>
      </svg>
    </div>
  );
};

export default NewsPlaceholder; 