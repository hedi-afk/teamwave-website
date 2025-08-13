import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Import services
import eventService from '../../services/eventService';
import teamService from '../../services/teamService';
import memberService from '../../services/memberService';
import newsService from '../../services/newsService';
import videoService from '../../services/videoService';
import registrationService from '../../services/registrationService';
import contactService from '../../services/contactService';

interface DashboardStats {
  events: {
    total: number;
    upcoming: number;
    active: number;
    completed: number;
  };
  teams: {
    total: number;
    active: number;
    byGame: Array<{ game: string; count: number }>;
  };
  members: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  registrations: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  };
  content: {
    news: number;
    videos: number;
    published: number;
  };
  messages: {
    total: number;
    unread: number;
    byCategory: Array<{ category: string; count: number }>;
  };
  analytics: {
    pageViews: number;
    uniqueVisitors: number;
    engagement: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'event' | 'team' | 'member' | 'registration' | 'news' | 'video' | 'message';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  priority: 'high' | 'medium' | 'low';
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: string;
  count?: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');

  const quickActions: QuickAction[] = [
    {
      title: 'Create Event',
      description: 'Schedule a new tournament or event',
      icon: '🎮',
      link: '/admin/events',
      color: 'bg-neon-pink',
    },
    {
      title: 'Manage Teams',
      description: 'View and manage professional teams',
      icon: '🏆',
      link: '/admin/teams',
      color: 'bg-neon-blue',
    },
    {
      title: 'Review Registrations',
      description: 'Approve or reject event registrations',
      icon: '📝',
      link: '/admin/registrations',
      color: 'bg-neon-green',
    },
    {
      title: 'Publish News',
      description: 'Create and publish news articles',
      icon: '📰',
      link: '/admin/news',
      color: 'bg-neon-purple',
    },
    {
      title: 'Upload Videos',
      description: 'Add new video content',
      icon: '🎥',
      link: '/admin/videos',
      color: 'bg-orange-500',
    },
    {
      title: 'Messages',
      description: 'View contact messages',
      icon: '💬',
      link: '/admin/messages',
      color: 'bg-cyan-500',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        events,
        teams,
        members,
        registrations,
        news,
        videos,
        messages
      ] = await Promise.all([
        eventService.getAllEvents(),
        teamService.getAllTeams(),
        memberService.getAllMembers(),
        registrationService.getAllRegistrations(),
        newsService.getAllArticles(),
        videoService.getAllVideos(),
        contactService.getAllMessages()
      ]);

      // Calculate statistics
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const upcomingEvents = events.filter((e: any) => new Date(e.startDate) > now);
      const activeEvents = events.filter((e: any) => e.status === 'active');   
      const completedEvents = events.filter((e: any) => e.status === 'completed');

      // Team statistics by game
      const teamGameStats = teams.reduce((acc: any, team: any) => {
        acc[team.game] = (acc[team.game] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const teamByGame = Object.entries(teamGameStats).map(([game, count]) => ({
        game,
        count: count as number
      }));

      // Registration statistics - handle both paginated and non-paginated responses
      const registrationArray = Array.isArray(registrations) ? registrations : registrations.registrations || [];
      const regStats = {
        total: registrationArray.length,
        pending: registrationArray.filter((r: any) => r.status === 'pending').length,
        approved: registrationArray.filter((r: any) => r.status === 'approved').length,
        rejected: registrationArray.filter((r: any) => r.status === 'rejected').length,
        recent: registrationArray.filter((r: any) => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
      };

      // Member statistics
      const newMembersThisMonth = members.filter((m: any) => m.createdAt && new Date(m.createdAt) >= thisMonth).length;

            // Message statistics - handle ContactMessagesResponse structure
      const messageArray = messages.data || [];
      const messageStats = {
        total: messageArray.length,
        unread: messageArray.filter((m: any) => !m.read).length,
        byCategory: messageArray.reduce((acc: any, msg: any) => { 
          acc[msg.category] = (acc[msg.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };



      // Generate recent activity
      const activities: RecentActivity[] = [
        ...(registrationArray.slice(0, 3).map((reg: any) => ({
          id: reg._id,
          type: 'registration' as const,
          title: `New Registration: ${reg.eventId?.name || 'Unknown Event'}`,
          description: `${reg.playerName} registered for ${reg.eventId?.name || 'Unknown Event'}`,
          timestamp: new Date(reg.createdAt).toLocaleString(),
          status: reg.status,
          priority: reg.status === 'pending' ? 'high' : 'medium'
        }))),
        ...(messageArray.filter((m: any) => !m.read).slice(0, 2).map((msg: any) => ({
          id: msg._id,
          type: 'message' as const,
          title: `New Message: ${msg.subject}`,
          description: `From ${msg.name} - ${msg.category}`,
          timestamp: new Date(msg.createdAt).toLocaleString(),
          priority: 'high'
        }))),
        ...upcomingEvents.slice(0, 2).map((event: any) => ({
          id: event._id,
          type: 'event' as const,
          title: `Upcoming Event: ${event.name}`,
          description: `Starting ${new Date(event.startDate).toLocaleDateString()}`,
          timestamp: new Date(event.createdAt).toLocaleString(),
          priority: 'medium'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        events: {
          total: events.length,
          upcoming: upcomingEvents.length,
          active: activeEvents.length,
          completed: completedEvents.length
        },
        teams: {
          total: teams.length,
          active: teams.filter((t: any) => t.status === 'active').length,
          byGame: teamByGame
        },
        members: {
          total: members.length,
          active: members.filter((m: any) => m.status === 'active').length,
          newThisMonth: newMembersThisMonth
        },
        registrations: regStats,
        content: {
          news: news.length,
          videos: videos.videos?.length || 0,
          published: news.filter((n: any) => n.published).length
        },
        messages: {
          total: messageStats.total,
          unread: messageStats.unread,
          byCategory: Object.entries(messageStats.byCategory).map(([category, count]) => ({
            category,
            count: count as number
          }))
        },
        analytics: {
          pageViews: Math.floor(Math.random() * 10000) + 5000, // Mock data
          uniqueVisitors: Math.floor(Math.random() * 2000) + 1000,
          engagement: Math.floor(Math.random() * 30) + 60
        }
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'event': return '🎮';
      case 'team': return '🏆';
      case 'member': return '👤';
      case 'registration': return '📝';
      case 'news': return '📰';
      case 'video': return '🎥';
      case 'message': return '💬';
      default: return '📌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-retro-black pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-pink mx-auto mb-4"></div>
              <p className="text-neon-pink text-lg">Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-retro-black pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Dashboard Error</h3>
            <p>{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome back! Here's what's happening with TeamWave today.</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex bg-dark-purple/30 rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-neon-pink text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </button>
              ))}
            </div>
            
            <button
              onClick={fetchDashboardData}
              className="bg-neon-blue text-white px-4 py-2 rounded-lg hover:bg-neon-blue/80 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-neon-pink/20 to-neon-pink/10 border border-neon-pink/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">🎮</div>
                  <div className="text-neon-pink text-sm font-medium">Events</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.events.total}</div>
                <div className="text-gray-400 text-sm">
                  {stats.events.upcoming} upcoming • {stats.events.active} active
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-neon-blue/20 to-neon-blue/10 border border-neon-blue/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">🏆</div>
                  <div className="text-neon-blue text-sm font-medium">Teams</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.teams.total}</div>
                <div className="text-gray-400 text-sm">
                  {stats.teams.active} active • {stats.teams.byGame.length} games
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-neon-green/20 to-neon-green/10 border border-neon-green/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">📝</div>
                  <div className="text-neon-green text-sm font-medium">Registrations</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.registrations.total}</div>
                <div className="text-gray-400 text-sm">
                  {stats.registrations.pending} pending • {stats.registrations.recent} new
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-neon-purple/20 to-neon-purple/10 border border-neon-purple/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">💬</div>
                  <div className="text-neon-purple text-sm font-medium">Messages</div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.messages.total}</div>
                <div className="text-gray-400 text-sm">
                  {stats.messages.unread} unread • {stats.messages.byCategory.length} categories
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-dark-purple/30 border border-gray-700 rounded-xl p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className={`${action.color} p-4 rounded-lg hover:scale-105 transition-all duration-200 group`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{action.icon}</div>
                      <div>
                        <h3 className="font-bold text-white">{action.title}</h3>
                        <p className="text-sm text-white/80">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2 bg-dark-purple/30 border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                  <Link to="/admin/activity" className="text-neon-pink hover:text-neon-pink/80 text-sm">
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 bg-dark-purple/20 rounded-lg border border-gray-600/30">
                        <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-white">{activity.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(activity.priority)}`}>
                              {activity.priority}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{activity.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{activity.timestamp}</span>
                            {activity.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">📭</div>
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Sidebar Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                {/* Analytics */}
                <div className="bg-dark-purple/30 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Analytics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Page Views</span>
                      <span className="text-white font-bold">{stats.analytics.pageViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Unique Visitors</span>
                      <span className="text-white font-bold">{stats.analytics.uniqueVisitors.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Engagement</span>
                      <span className="text-white font-bold">{stats.analytics.engagement}%</span>
                    </div>
                  </div>
                </div>

                {/* Content Overview */}
                <div className="bg-dark-purple/30 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Content Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">News Articles</span>
                      <span className="text-white font-bold">{stats.content.news}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Videos</span>
                      <span className="text-white font-bold">{stats.content.videos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Published</span>
                      <span className="text-white font-bold">{stats.content.published}</span>
                    </div>
                  </div>
                </div>

                {/* Team Distribution */}
                <div className="bg-dark-purple/30 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Teams by Game</h3>
                  <div className="space-y-3">
                    {stats.teams.byGame.slice(0, 5).map((game) => (
                      <div key={game.game} className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{game.game}</span>
                        <span className="text-white font-bold">{game.count}</span>
                      </div>
                    ))}
                    {stats.teams.byGame.length > 5 && (
                      <div className="text-center pt-2">
                        <span className="text-neon-pink text-sm">+{stats.teams.byGame.length - 5} more</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 