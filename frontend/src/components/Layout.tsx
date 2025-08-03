import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-retro-black">
      <Header />
      <main className="flex-grow">
        <div className="pt-20">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 