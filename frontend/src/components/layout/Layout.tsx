import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen dark">
      <Header />
      <main className="flex-grow pt-44 content-container">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 