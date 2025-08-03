import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  const [lives, setLives] = useState(3);
  const [showContinue, setShowContinue] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Show continue prompt after 2 seconds
    const continueTimer = setTimeout(() => {
      setShowContinue(true);
    }, 2000);

    // Start countdown if continue is shown
    let countdownInterval: NodeJS.Timeout;
    if (showContinue) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(continueTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showContinue]);

  // If countdown reaches 0, redirect to home
  useEffect(() => {
    if (countdown === 0) {
      window.location.href = '/';
    }
  }, [countdown]);

  // Handle continue
  const handleContinue = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-retro-black px-4 py-12 relative overflow-hidden pt-32">
      {/* Retro grid background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(20,20,40,0.8)_2px,transparent_2px),linear-gradient(90deg,rgba(20,20,40,0.8)_2px,transparent_2px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]"></div>
      
      {/* Scanlines effect */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_3px,rgba(255,255,255,0.1)_3px)]"></div>
      
      <div className="text-center max-w-lg z-20 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* CRT screen frame */}
          <div className="absolute -inset-8 border-8 border-dark-purple rounded-lg opacity-80 shadow-[0_0_15px_rgba(212,66,248,0.4)] z-0"></div>
          
          {/* Glitched 404 text */}
          <h1 className="text-8xl font-pixel text-neon-pink mb-6 text-glitch-effect relative z-10 [text-shadow:0_0_10px_rgba(255,42,109,0.7)]">404</h1>
          
          <motion.div 
            className="mb-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl font-arcade text-neon-green mb-4">GAME OVER</h2>
              <p className="text-gray-300 mb-2 font-pixel text-sm leading-relaxed">THE LEVEL YOU'RE LOOKING FOR</p>
              <p className="text-gray-300 mb-6 font-pixel text-sm leading-relaxed">DOESN'T EXIST OR HAS BEEN MOVED</p>
              
              {/* Lives counter */}
              <div className="flex justify-center items-center gap-2 mb-4">
                <span className="text-white font-arcade">LIVES:</span>
                {[...Array(lives)].map((_, i) => (
                  <span key={i} className="text-2xl">❤️</span>
                ))}
                {[...Array(3 - lives)].map((_, i) => (
                  <span key={i} className="text-2xl opacity-30">❤️</span>
                ))}
              </div>

              {/* High score section */}
              <div className="flex justify-center items-center gap-4 mb-6 text-neon-blue font-arcade">
                <div>
                  <div className="text-xs text-gray-400">HIGH SCORE</div>
                  <div>0042650</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">SCORE</div>
                  <div>0000404</div>
                </div>
              </div>
            </div>
            
            {/* Pixelated arcade decorations */}
            <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-neon-blue opacity-70"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-neon-pink opacity-70"></div>
          </motion.div>
          
          {showContinue ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <p className="text-neon-green font-arcade mb-4 animate-pulse-slow">CONTINUE? {countdown}</p>
              <button 
                onClick={handleContinue}
                className="pixel-btn bg-neon-pink text-white border-neon-pink hover:bg-white hover:text-neon-pink"
              >
                INSERT COIN
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/" className="pixel-btn bg-neon-pink text-white border-neon-pink hover:bg-white hover:text-neon-pink">
                RETURN TO HOME
              </Link>
              <button 
                onClick={() => window.history.back()} 
                className="pixel-btn text-neon-blue border-neon-blue hover:bg-neon-blue hover:text-retro-black"
              >
                GO BACK
              </button>
            </motion.div>
          )}
        </motion.div>
        
        {/* Arcade cabinet illustration */}
        <motion.div 
          className="mt-12 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="w-48 h-72 mx-auto bg-gradient-to-b from-dark-purple to-dark-purple/30 rounded-t-lg border-2 border-neon-purple relative overflow-hidden">
            {/* Screen */}
            <div className="absolute inset-3 rounded bg-retro-black overflow-hidden flex items-center justify-center border border-gray-800">
              <div className="w-full h-full relative">
                {/* Space invader game scene */}
                <div className="absolute top-2 left-2 w-4 h-4 bg-neon-green" style={{clipPath: 'polygon(0% 20%, 20% 20%, 20% 40%, 40% 40%, 40% 20%, 60% 20%, 60% 40%, 80% 40%, 80% 20%, 100% 20%, 100% 60%, 80% 60%, 80% 80%, 60% 80%, 60% 100%, 40% 100%, 40% 80%, 20% 80%, 20% 60%, 0% 60%)'}}></div>
                <div className="absolute top-2 right-2 w-4 h-4 bg-neon-pink" style={{clipPath: 'polygon(0% 20%, 20% 20%, 20% 40%, 40% 40%, 40% 20%, 60% 20%, 60% 40%, 80% 40%, 80% 20%, 100% 20%, 100% 60%, 80% 60%, 80% 80%, 60% 80%, 60% 100%, 40% 100%, 40% 80%, 20% 80%, 20% 60%, 0% 60%)'}}></div>
                <div className="absolute bottom-2 left-2/4 transform -translate-x-1/2 w-6 h-2 bg-neon-blue"></div>
                <div className="absolute bottom-6 left-2/4 transform -translate-x-1/2 w-1 h-1 bg-white animate-ping"></div>

                {/* 404 text inside the game scene */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-pixel text-red-500 text-xs animate-pulse">ERROR 404</span>
                </div>
              </div>
            </div>

            {/* Cabinet body */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-dark-purple border-2 border-neon-purple"></div>
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-dark-purple border-2 border-neon-purple"></div>
            
            {/* Joystick and buttons */}
            <div className="absolute -bottom-24 left-1/3 transform -translate-x-1/2">
              <div className="w-10 h-10 rounded-full bg-black border-2 border-gray-700 flex items-center justify-center">
                <div className="w-4 h-8 bg-gray-800 rounded-full transform rotate-45"></div>
              </div>
            </div>
            <div className="absolute -bottom-24 right-4 flex space-x-2">
              <div className="w-6 h-6 rounded-full bg-neon-red border border-white"></div>
              <div className="w-6 h-6 rounded-full bg-neon-blue border border-white"></div>
            </div>
            
            {/* Cabinet decoration */}
            <div className="absolute top-0 left-0 w-full h-4 bg-neon-purple/30 flex items-center justify-center">
              <span className="font-pixel text-white text-[8px]">TEAMWAVE ARCADE</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage; 