import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Tournament {
  id: string;
  name: string;
  game: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  teams: number;
  prizePool: string;
  format: string;
  registrationDeadline: string;
}

const TournamentsPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'CS:GO Championship 2024',
      game: 'CS:GO',
      startDate: '2024-04-15',
      endDate: '2024-04-20',
      status: 'upcoming',
      teams: 16,
      prizePool: '$5,000',
      format: 'Double Elimination',
      registrationDeadline: '2024-04-10',
    },
    {
      id: '2',
      name: 'Valorant Pro League Season 2',
      game: 'Valorant',
      startDate: '2024-03-20',
      endDate: '2024-04-15',
      status: 'ongoing',
      teams: 24,
      prizePool: '$3,000',
      format: 'Round Robin + Playoffs',
      registrationDeadline: '2024-03-15',
    },
    {
      id: '3',
      name: 'League of Legends Spring Cup',
      game: 'League of Legends',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      status: 'completed',
      teams: 20,
      prizePool: '$4,000',
      format: 'Single Elimination',
      registrationDeadline: '2024-01-25',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'ongoing':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-purple">
      <AdminSidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Tournaments Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-neon-pink text-white px-4 py-2 rounded-md hover:bg-neon-pink/90 transition-colors"
          >
            Create Tournament
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-purple-light rounded-lg border border-neon-pink/20 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                  <p className="text-neon-pink">{tournament.game}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)} text-white`}>
                  {tournament.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Start Date:</span>
                  <span className="text-white">{tournament.startDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">End Date:</span>
                  <span className="text-white">{tournament.endDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Teams:</span>
                  <span className="text-white">{tournament.teams}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Prize Pool:</span>
                  <span className="text-white">{tournament.prizePool}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white">{tournament.format}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Registration Deadline:</span>
                  <span className="text-white">{tournament.registrationDeadline}</span>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-neon-pink text-white py-2 px-4 rounded-md hover:bg-neon-pink/90 transition-colors">
                  Manage
                </button>
                <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-neon-pink mb-4">Create New Tournament</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Tournament Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-pink/30 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Game</label>
                  <select className="w-full px-4 py-2 bg-dark-purple border border-neon-pink/30 rounded-md text-white">
                    <option>CS:GO</option>
                    <option>Valorant</option>
                    <option>League of Legends</option>
                    <option>Dota 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-pink/30 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-pink/30 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Prize Pool</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-pink/30 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Format</label>
                  <select className="w-full px-4 py-2 bg-dark-purple border border-neon-pink/30 rounded-md text-white">
                    <option>Single Elimination</option>
                    <option>Double Elimination</option>
                    <option>Round Robin + Playoffs</option>
                    <option>Swiss System</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-white hover:text-neon-pink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-neon-pink text-white rounded-md hover:bg-neon-pink/90 transition-colors"
                  >
                    Create Tournament
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage; 