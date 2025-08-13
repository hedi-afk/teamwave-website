import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout components
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import ScrollToTop from './components/layout/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import MembersPage from './pages/MembersPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import ShopPage from './pages/ShopPage';
import ForumPage from './pages/ForumPage';
import ArticlePage from './pages/ArticlePage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

import PartnerDetailPage from './pages/PartnerDetailPage';
import SponsorDetailPage from './pages/SponsorDetailPage';
import MemberDetailPage from './pages/MemberDetailPage';
import TeamDetailPage from './pages/TeamDetailPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEventsPage from './pages/admin/EventsPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminMembersPage from './pages/admin/MembersPage';
import AdminTeamsPage from './pages/admin/TeamsPage';
import AdminGamesPage from './pages/admin/GamesPage';
import AdminNewsPage from './pages/admin/NewsPage';
import AdminVideosPage from './pages/admin/VideosPage';
import AdminShopPage from './pages/admin/ShopPage';
import AdminPartnersPage from './pages/admin/PartnersPage';
import AdminMessagesPage from './pages/admin/MessagesPage';
import AdminSettingsPage from './pages/admin/SettingsPage';


// Auth components
import ProtectedRoute from './components/admin/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

// Wrapper component to provide children to Layout
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AnimatePresence mode="sync">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LayoutWrapper />}>
                <Route index element={<HomePage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="members/:id" element={<MemberDetailPage />} />
                <Route path="teams/:id" element={<TeamDetailPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="forum" element={<ForumPage />} />
                <Route path="article/:id" element={<ArticlePage />} />
                <Route path="partner/:id" element={<PartnerDetailPage />} />
                <Route path="sponsor/:id" element={<SponsorDetailPage />} />
                <Route path="contact" element={<ContactPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="registrations" element={<AdminRegistrationsPage />} />
                <Route path="members" element={<AdminMembersPage />} />
                <Route path="teams" element={<AdminTeamsPage />} />
                <Route path="games" element={<AdminGamesPage />} />
                <Route path="news" element={<AdminNewsPage />} />
                <Route path="videos" element={<AdminVideosPage />} />
                <Route path="shop" element={<AdminShopPage />} />
                <Route path="partners" element={<AdminPartnersPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />

              </Route>
            </Routes>
          </AnimatePresence>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
