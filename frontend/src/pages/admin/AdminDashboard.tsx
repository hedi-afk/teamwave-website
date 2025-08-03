import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalVisitors: number;
  activeUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalTeams: number;
  activeTournaments: number;
  totalStreams: number;
  revenue: number;
}

interface RecentActivity {
  type: string;
  description: string;
  time: string;
  user: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVisitors: 0,
    activeUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalTeams: 0,
    activeTournaments: 0,
    totalStreams: 0,
    revenue: 0,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      type: 'tournament',
      description: 'New tournament registration: CS:GO Championship',
      time: '2 minutes ago',
      user: 'Admin',
    },
    {
      type: 'team',
      description: 'New team registration: TeamWave Elite',
      time: '1 hour ago',
      user: 'Admin',
    },
    {
      type: 'stream',
      description: 'Stream scheduled: Valorant Tournament Finals',
      time: '3 hours ago',
      user: 'Admin',
    },
    {
      type: 'event',
      description: 'Event created: League of Legends Workshop',
      time: '5 hours ago',
      user: 'Admin',
    },
  ]);

  useEffect(() => {
    // In production, fetch real stats from your backend
    setStats({
      totalVisitors: 1234,
      activeUsers: 56,
      totalEvents: 12,
      upcomingEvents: 3,
      totalTeams: 8,
      activeTournaments: 2,
      totalStreams: 15,
      revenue: 2500,
    });
  }, []);

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-purple-light p-6 rounded-lg border border-neon-pink/20"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Total Visitors</h3>
            <p className="text-3xl font-bold text-neon-pink">{stats.totalVisitors}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-purple-light p-6 rounded-lg border border-neon-pink/20"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-neon-pink">{stats.activeUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-purple-light p-6 rounded-lg border border-neon-pink/20"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Active Tournaments</h3>
            <p className="text-3xl font-bold text-neon-pink">{stats.activeTournaments}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-dark-purple-light p-6 rounded-lg border border-neon-pink/20"
          >
            <h3 className="text-lg font-semibold text-white mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-neon-pink">${stats.revenue}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-dark-purple-light p-6 rounded-lg border border-neon-pink/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-neon-pink text-white py-2 px-4 rounded-md hover:bg-neon-pink/90 transition-colors">
                Create Tournament
              </button>
              <button className="bg-neon-pink text-white py-2 px-4 rounded-md hover:bg-neon-pink/90 transition-colors">
                Schedule Stream
              </button>
              <button className="bg-neon-pink text-white py-2 px-4 rounded-md hover:bg-neon-pink/90 transition-colors">
                Add Team
              </button>
              <button className="bg-neon-pink text-white py-2 px-4 rounded-md hover:bg-neon-pink/90 transition-colors">
                Create Event
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-purple-light p-6 rounded-lg border border-neon-pink/20"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'tournament' ? 'bg-yellow-400' :
                    activity.type === 'team' ? 'bg-blue-400' :
                    activity.type === 'stream' ? 'bg-purple-400' :
                    'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-400">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 