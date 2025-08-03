import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import config from '../../config';
import { IMember } from '../../services/memberService';
import ImageUploadWithCropper from '../../components/ui/ImageUploadWithCropper';
import uploadService from '../../services/uploadService';
import gameService from '../../services/gameService';

interface ITeam {
  _id?: string;
  name: string;
  game: string;
  description: string;
  logo: string;
  status: 'active' | 'inactive' | 'pending';
  members: string[];
  achievements: Array<{
    title: string;
    date: Date;
    description: string;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamFormData {
  name: string;
  game: string;
  description: string;
  logo: string;
  status: 'active' | 'inactive' | 'pending';
  members: string[];
  achievements: Array<{
    title: string;
    date: string;
    description: string;
  }>;
}

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentTeam, setCurrentTeam] = useState<ITeam | null>(null);
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  
  // Form state for adding/editing teams
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    game: '',
    description: '',
    logo: '',
    status: 'active',
    members: [],
    achievements: []
  });

  // Fetch teams, members, and games from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch teams
        const teamsResponse = await axios.get(`${config.apiUrl}/teams`);
        setTeams(teamsResponse.data);
        
        // Fetch members (only players and coaches)
        const membersResponse = await axios.get(`${config.apiUrl}/members`);
        const playersAndCoaches = membersResponse.data.filter((member: IMember) => 
          member.role === 'Player' || member.role === 'Coach'
        );
        setMembers(playersAndCoaches);
        
        // Fetch featured games
        const gamesResponse = await gameService.getFeaturedGames();
        setAvailableGames(gamesResponse.map(game => game.name));
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please check the API connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle member selection
  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter(id => id !== memberId)
        : [...prev.members, memberId]
    }));
  };

  // Achievement management functions
  const handleAchievementChange = (index: number, field: 'title' | 'date' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? { ...achievement, [field]: value } : achievement
      )
    }));
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { title: '', date: new Date().toISOString().slice(0, 10), description: '' }]
    }));
  };

  const removeAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission for adding new team
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const teamData = {
        ...formData,
        name: `TeamWave ${formData.game}`,
        members: formData.members,
        achievements: formData.achievements.map(ach => ({
          ...ach,
          date: new Date(ach.date)
        }))
      };
      
      const response = await axios.post(`${config.apiUrl}/teams`, teamData);
      const newTeam = response.data;
      
      setTeams([...teams, newTeam]);
      setSuccess(`Team "${newTeam.name}" was successfully created!`);
      setTimeout(() => setSuccess(null), 3000);
      
      resetForm();
      setShowAddModal(false);
      
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for editing team
  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTeam?._id) return;
    
    try {
      setLoading(true);
      
      const teamData = {
        ...formData,
        name: `TeamWave ${formData.game}`,
        members: formData.members,
        achievements: formData.achievements.map(ach => ({
          ...ach,
          date: new Date(ach.date)
        }))
      };
      
      const response = await axios.put(`${config.apiUrl}/teams/${currentTeam._id}`, teamData);
      const updatedTeam = response.data;
      
      setTeams(teams.map(team => team._id === currentTeam._id ? updatedTeam : team));
      setSuccess(`Team "${updatedTeam.name}" was successfully updated!`);
      setTimeout(() => setSuccess(null), 3000);
      
      setShowEditModal(false);
      setCurrentTeam(null);
      resetForm();
      
    } catch (err: any) {
      console.error('Error updating team:', err);
      setError(err.response?.data?.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a team
  const confirmDeleteTeam = (id: string, name: string) => {
    setTeamToDelete({ id, name });
    setShowDeleteModal(true);
  };
  
  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      setLoading(true);
      
      await axios.delete(`${config.apiUrl}/teams/${teamToDelete.id}`);
      
      setTeams(teams.filter(team => team._id !== teamToDelete.id));
      setSuccess(`Team "${teamToDelete.name}" has been successfully deleted`);
      setTimeout(() => setSuccess(null), 3000);
      
      setShowDeleteModal(false);
      setTeamToDelete(null);
      
    } catch (err: any) {
      console.error('Error deleting team:', err);
      setError(err.response?.data?.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTeamToDelete(null);
  };

  // Initialize edit form
  const initEditForm = (team: ITeam) => {
    setCurrentTeam(team);
    setFormData({
      name: team.name,
      game: team.game,
      description: team.description,
      logo: team.logo,
      status: team.status,
      members: team.members,
      achievements: team.achievements.map(ach => ({
        title: ach.title,
        date: ach.date.toISOString().slice(0, 10), // Format date to YYYY-MM-DD
        description: ach.description
      }))
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      game: '',
      description: '',
      logo: '',
      status: 'active',
      members: [],
      achievements: []
    });
  };

  // Get member by ID
  const getMemberById = (memberId: string) => {
    return members.find(member => member._id === memberId);
  };

  // Get image URL
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return 'https://placehold.co/100/8A2BE2/FFFFFF?text=TW';
    return uploadService.getImageUrl(imagePath);
  };

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-blue">Teams Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-neon-pink text-white rounded hover:bg-neon-pink/80 transition-colors"
          >
            Add New Team
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded text-green-400">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-neon-purple text-xl font-pixel">LOADING TEAMS...</div>
          </div>
        )}

        {/* Teams Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {teams.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-300 text-lg">No teams found. Create your first team!</p>
              </div>
            ) : (
              teams.map((team) => (
            <motion.div
                  key={team._id}
                  className="arcade-card bg-dark-purple/30 overflow-hidden flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Team Header */}
                  <div className="p-6 border-b border-neon-pink/20 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-neon-blue flex items-center justify-center overflow-hidden mr-3">
                          <img 
                            src={getImageUrl(team.logo)} 
                            alt={team.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://placehold.co/100/8A2BE2/FFFFFF?text=${team.game.slice(0, 2)}`;
                            }}
                          />
                        </div>
                <div>
                          <h3 className="text-xl font-pixel text-white">{team.name}</h3>
                          <p className="text-neon-green text-sm">{team.game}</p>
                        </div>
                </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        team.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        team.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                  {team.status}
                </span>
              </div>
              
                    <p className="text-gray-300 text-sm mb-4">{team.description}</p>
                    
                    {/* Team Members - Fixed Height */}
                    <div className="mb-4 flex-1">
                      <h4 className="text-neon-pink text-sm font-semibold mb-2">Team Members ({team.members.length})</h4>
                      <div className="h-24 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-neon-pink/30 scrollbar-track-dark-purple/20 hover:scrollbar-thumb-neon-pink/50">
                        {team.members.length === 0 ? (
                          <p className="text-gray-500 text-xs">No members assigned</p>
                        ) : (
                          team.members.map((memberId) => {
                            const member = getMemberById(memberId);
                            return member ? (
                              <div key={memberId} className="flex items-center text-xs">
                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                                  <img 
                                    src={getImageUrl(member.avatar)} 
                                    alt={member.username}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = `https://placehold.co/100/8A2BE2/FFFFFF?text=${member.username.slice(0, 2)}`;
                                    }}
                                  />
                                </div>
                                <span className="text-white">{member.username}</span>
                                <span className="text-gray-400 ml-1">({member.role})</span>
                              </div>
                            ) : null;
                          })
                        )}
                      </div>
                    </div>

                    {/* Team Achievements - Fixed Height */}
                    <div className="mb-4">
                      <h4 className="text-neon-green text-sm font-semibold mb-2">Achievements ({team.achievements?.length || 0})</h4>
                      <div className="h-20 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-neon-green/30 scrollbar-track-dark-purple/20 hover:scrollbar-thumb-neon-green/50">
                        {!team.achievements || team.achievements.length === 0 ? (
                          <p className="text-gray-500 text-xs">No achievements yet</p>
                        ) : (
                          team.achievements.map((achievement, index) => (
                            <div key={index} className="text-xs">
                              <div className="text-white font-medium">{achievement.title}</div>
                              <div className="text-gray-400">{achievement.description}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Actions - Fixed at bottom */}
                  <div className="p-4 flex justify-between mt-auto">
                    <button
                      onClick={() => initEditForm(team)}
                      className="text-neon-pink hover:text-neon-pink/80 transition-colors text-sm"
                    >
                      Edit Team
                    </button>
                    <button
                      onClick={() => confirmDeleteTeam(team._id!, team.name)}
                      className="text-red-500 hover:text-red-400 transition-colors text-sm"
                    >
                      Delete Team
                    </button>
                  </div>
                </motion.div>
              ))
            )}
                </div>
        )}

        {/* Add Team Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-dark-purple w-full max-w-2xl rounded-lg shadow-lg overflow-hidden max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Team</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleAddTeam}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Game</label>
                      <select
                        name="game"
                        value={formData.game}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      >
                        <option value="">Select a game</option>
                        {availableGames.map(game => (
                          <option key={game} value={game}>{game}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Team Logo</label>
                      <ImageUploadWithCropper
                        initialImage={formData.logo}
                        onImageUpload={(imagePath) => {
                          setFormData({
                            ...formData,
                            logo: imagePath
                          });
                        }}
                        placeholderText="Team Logo"
                        className="w-full"
                        uploadType="member"
                        aspectRatio={1}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Team Members</label>
                      <div className="max-h-48 overflow-y-auto border border-gray-700 rounded p-2">
                        {members.length === 0 ? (
                          <p className="text-gray-500 text-sm">No players or coaches available</p>
                        ) : (
                          members.map((member) => (
                            <div key={member._id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={member._id || ''}
                                checked={member._id ? formData.members.includes(member._id) : false}
                                onChange={() => member._id && handleMemberToggle(member._id)}
                                className="mr-2"
                              />
                              <label htmlFor={member._id} className="text-sm text-white cursor-pointer">
                                {member.username} ({member.role}) - {member.primaryGame || 'No primary game'}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Team Achievements */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">Team Achievements</label>
                        <button
                          type="button"
                          onClick={addAchievement}
                          className="text-sm text-neon-green hover:text-neon-green/80 transition-colors"
                        >
                          + Add Achievement
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formData.achievements.map((achievement, index) => (
                          <div key={index} className="border border-gray-700 rounded p-3 bg-dark-purple/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-400">Achievement {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeAchievement(index)}
                                className="text-red-500 hover:text-red-400 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Achievement title"
                                value={achievement.title}
                                onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white text-sm focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                              />
                              <input
                                type="date"
                                value={achievement.date}
                                onChange={(e) => handleAchievementChange(index, 'date', e.target.value)}
                                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white text-sm focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                              />
                              <textarea
                                placeholder="Achievement description"
                                value={achievement.description}
                                onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white text-sm focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                              />
                            </div>
                          </div>
                        ))}
                        {formData.achievements.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">No achievements added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-neon-pink text-white rounded hover:bg-neon-pink/80 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Team'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditModal && currentTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-dark-purple w-full max-w-2xl rounded-lg shadow-lg overflow-hidden max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Team</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleEditTeam}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Game</label>
                      <select
                        name="game"
                        value={formData.game}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      >
                        {availableGames.map(game => (
                          <option key={game} value={game}>{game}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Team Logo</label>
                      <ImageUploadWithCropper
                        initialImage={formData.logo}
                        onImageUpload={(imagePath) => {
                          setFormData({
                            ...formData,
                            logo: imagePath
                          });
                        }}
                        placeholderText="Team Logo"
                        className="w-full"
                        uploadType="member"
                        aspectRatio={1}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Team Members</label>
                      <div className="max-h-48 overflow-y-auto border border-gray-700 rounded p-2">
                        {members.map((member) => (
                          <div key={member._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id={`edit-${member._id || ''}`}
                              checked={member._id ? formData.members.includes(member._id) : false}
                              onChange={() => member._id && handleMemberToggle(member._id)}
                              className="mr-2"
                            />
                            <label htmlFor={`edit-${member._id}`} className="text-sm text-white cursor-pointer">
                              {member.username} ({member.role}) - {member.primaryGame || 'No primary game'}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Achievements */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">Team Achievements</label>
                        <button
                          type="button"
                          onClick={addAchievement}
                          className="text-sm text-neon-green hover:text-neon-green/80 transition-colors"
                        >
                          + Add Achievement
                </button>
                      </div>
                      <div className="space-y-3">
                        {formData.achievements.map((achievement, index) => (
                          <div key={index} className="border border-gray-700 rounded p-3 bg-dark-purple/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-400">Achievement {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeAchievement(index)}
                                className="text-red-500 hover:text-red-400 text-sm"
                              >
                  Remove
                </button>
                            </div>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Achievement title"
                                value={achievement.title}
                                onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                              />
                              <input
                                type="date"
                                value={achievement.date}
                                onChange={(e) => handleAchievementChange(index, 'date', e.target.value)}
                                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                              />
                              <textarea
                                placeholder="Achievement description"
                                value={achievement.description}
                                onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-dark-purple border border-gray-700 rounded text-white text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                              />
                            </div>
                          </div>
                        ))}
                        {formData.achievements.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">No achievements added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-neon-blue text-white rounded hover:bg-neon-blue/80 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Team'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
        </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && teamToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-dark-purple w-full max-w-md rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Confirm Delete</h2>
                  <button
                    onClick={cancelDelete}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-300 mb-2">
                    Are you sure you want to delete the team "{teamToDelete.name}"?
                  </p>
                  <p className="text-red-400 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-500 text-gray-300 rounded mr-2 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTeam}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete Team'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage; 