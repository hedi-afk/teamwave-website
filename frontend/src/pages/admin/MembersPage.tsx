import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import memberService, { IMember } from '../../services/memberService';
import teamService, { ITeam } from '../../services/teamService';
import gameService, { IGame } from '../../services/gameService';
import { format } from 'date-fns';
import config from '../../config';
import ImageUploadWithCropper from '../../components/ui/ImageUploadWithCropper';
import uploadService from '../../services/uploadService';

type MemberRole = 'Player' | 'Coach' | 'Content Creator' | 'Social Media Manager';
type GameTeam = 'CS:GO' | 'Valorant' | 'League of Legends' | 'Fortnite' | 'Rocket League' | 'Not Applicable';

interface Member {
  id: string;
  name: string;
  role: MemberRole;
  team: GameTeam;
  joinDate: string;
  email: string;
  bio: string;
  profileImage: string;
  status: 'active' | 'inactive';
}

// Interface for form data (simplified from IMember)
interface MemberFormData {
  username: string;
  fullName: string;
  avatar: string;
  role: 'Player' | 'Coach' | 'Content Creator' | 'Social Media Manager';
  primaryGame: string;
  joinDate: string;
  secondaryGames: string[];
  rank: string;
  bio: string;
  achievements: string[];
  socialLinks: {
    twitter: string;
    instagram: string;
    twitch: string;
    youtube: string;
    discord: string;
  };
}

const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<IMember[]>([]);
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentMember, setCurrentMember] = useState<IMember | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  
  // Form state for adding/editing members
  const [formData, setFormData] = useState<MemberFormData>({
    username: '',
    fullName: '',
    avatar: '',
    role: 'Player',
    primaryGame: '',
    joinDate: new Date().toISOString().split('T')[0], // Today's date as default
    secondaryGames: [],
    rank: 'Rookie',
    bio: '',
    achievements: [],
    socialLinks: {
      twitter: '',
      instagram: '',
      twitch: '',
      youtube: '',
      discord: ''
    }
  });

  // Confirmation state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersData, teamsData, gamesData] = await Promise.all([
        memberService.getAllMembers(),
        teamService.getAllTeams(),
        gameService.getActiveGames()
      ]);
      setMembers(membersData);
      setTeams(teamsData);
      setGames(gamesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please check the API connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested social links
    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1] as keyof typeof formData.socialLinks;
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle array input changes (secondaryGames, achievements)
  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'secondaryGames' | 'achievements', index: number) => {
    const { value } = e.target;
    const newArray = [...formData[field]];
    newArray[index] = value;
    
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  // Add new item to an array field
  const addArrayItem = (field: 'secondaryGames' | 'achievements') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  // Remove item from an array field
  const removeArrayItem = (field: 'secondaryGames' | 'achievements', index: number) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  // Handle form submission for adding new member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare data for API with proper formatting for the Member schema
      const memberData: IMember = {
        username: formData.username,
        fullName: formData.fullName,
        avatar: formData.avatar || `https://placehold.co/100/8A2BE2/FFFFFF?text=${encodeURIComponent(formData.username)}`,
        role: formData.role,
        primaryGame: formData.role === 'Content Creator' || formData.role === 'Social Media Manager' ? undefined : formData.primaryGame,
        secondaryGames: formData.secondaryGames.filter(g => g.trim() !== ''),
        rank: formData.rank,
        bio: formData.bio,
        achievements: formData.achievements.filter(a => a.trim() !== ''),
        socialLinks: {
          twitter: formData.socialLinks.twitter || '',
          instagram: formData.socialLinks.instagram || '',
          twitch: formData.socialLinks.twitch || '',
          youtube: formData.socialLinks.youtube || '',
          discord: formData.socialLinks.discord || ''
        },
        joinDate: new Date(formData.joinDate)
      };
      
      console.log('SUBMITTING MEMBER DATA TO SERVER:', JSON.stringify(memberData, null, 2));
      
      // Use the real service
      const newMember = await memberService.createMember(memberData);
      
      console.log('MEMBER SUCCESSFULLY CREATED:', JSON.stringify(newMember, null, 2));
      
      // Update local state
      const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
      
      // Show success message
      setSuccess(`Member "${formData.fullName}" was successfully added! ID: ${newMember._id}`);
      setTimeout(() => setSuccess(null), 5000);
      
      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      
      // Refresh members list after a short delay to ensure DB consistency
      setTimeout(async () => {
        try {
          const refreshedMembers = await memberService.getAllMembers();
          setMembers(refreshedMembers);
        } catch (err) {
          console.error('Error refreshing members:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Error creating member:', err);
      
      let errorMessage = 'Failed to create member';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
        console.error('Error response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Safe exit from edit form
  const safeExitEditForm = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirmation(true);
    } else {
      closeEditForm();
    }
  };
  
  // Confirm exit without saving
  const confirmExitWithoutSaving = () => {
    closeEditForm();
    setShowExitConfirmation(false);
  };
  
  // Close edit form and reset state
  const closeEditForm = () => {
    setShowEditModal(false);
    setCurrentMember(null);
    resetForm();
    setHasUnsavedChanges(false);
  };

  // Handle form submission for editing member
  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMember?._id) return;
    
    try {
      setLoading(true);
      
      // Prepare data for API with proper formatting for the Member schema
      const memberData: Partial<IMember> = {
        username: formData.username,
        fullName: formData.fullName,
        avatar: formData.avatar || `https://placehold.co/100/8A2BE2/FFFFFF?text=${encodeURIComponent(formData.username)}`,
        role: formData.role,
        primaryGame: formData.role === 'Content Creator' || formData.role === 'Social Media Manager' ? undefined : formData.primaryGame,
        joinDate: new Date(formData.joinDate),
        secondaryGames: formData.secondaryGames.filter(g => g.trim() !== ''),
        rank: formData.rank,
        bio: formData.bio,
        achievements: formData.achievements.filter(a => a.trim() !== ''),
        socialLinks: {
          twitter: formData.socialLinks.twitter || '',
          instagram: formData.socialLinks.instagram || '',
          twitch: formData.socialLinks.twitch || '',
          youtube: formData.socialLinks.youtube || '',
          discord: formData.socialLinks.discord || ''
        }
      };
      
      console.log('Updating member data:', memberData);
      
      // Use the real service
      const updatedMember = await memberService.updateMember(currentMember._id, memberData);
      
      console.log('Member updated:', updatedMember);
      
      // Update local state
      setMembers(members.map(member => member._id === currentMember._id ? updatedMember : member));
      
      // Show success message
      setSuccess(`Member "${formData.fullName}" was successfully updated`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Reset flags and close modal
      setHasUnsavedChanges(false);
      closeEditForm();
      
      // Refresh members list after a short delay to ensure DB consistency
      setTimeout(async () => {
        try {
          const refreshedMembers = await memberService.getAllMembers();
          setMembers(refreshedMembers);
        } catch (err) {
          console.error('Error refreshing members:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Error updating member:', err);
      
      let errorMessage = 'Failed to update member';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = `Server error (${err.response.status}): ${err.response.data?.message || err.message}`;
        console.error('Error response:', err.response.data);
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a member
  const confirmDeleteMember = (id: string, name: string) => {
    setMemberToDelete({ id, name });
    setShowDeleteModal(true);
  };
  
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    
    try {
      setLoading(true);
      
      // Use the real service
      await memberService.deleteMember(memberToDelete.id);
      
      // Update local state
      setMembers(members.filter(member => member._id !== memberToDelete.id));
      
      // Show temporary success message
      setError(null);
      const successMessage = `Member "${memberToDelete.name}" has been successfully deleted`;
      setSuccess(successMessage);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Close modal
      setShowDeleteModal(false);
      setMemberToDelete(null);
      
      // Refresh members list after a short delay to ensure DB consistency
      setTimeout(async () => {
        try {
          const refreshedMembers = await memberService.getAllMembers();
          setMembers(refreshedMembers);
        } catch (err) {
          console.error('Error refreshing members:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete member');
      console.error('Error deleting member:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setMemberToDelete(null);
    setShowDeleteModal(false);
  };

  // Initialize edit form with member data
  const initEditForm = (member: IMember) => {
    setCurrentMember(member);
    
    setFormData({
      username: member.username,
      fullName: member.fullName,
      avatar: member.avatar,
      role: member.role as 'Player' | 'Coach' | 'Content Creator' | 'Social Media Manager',
      primaryGame: member.primaryGame || '',
      joinDate: member.joinDate ? (typeof member.joinDate === 'string' ? member.joinDate : new Date(member.joinDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
      secondaryGames: member.secondaryGames || [],
      rank: member.rank,
      bio: member.bio,
      achievements: member.achievements,
      socialLinks: {
        twitter: member.socialLinks.twitter || '',
        instagram: member.socialLinks.instagram || '',
        twitch: member.socialLinks.twitch || '',
        youtube: member.socialLinks.youtube || '',
        discord: member.socialLinks.discord || ''
      }
    });
    
    setShowEditModal(true);
  };

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      avatar: '',
      role: 'Player',
      primaryGame: games.length > 0 ? games[0].name : '',
      joinDate: new Date().toISOString().split('T')[0], // Today's date as default
      secondaryGames: games.length > 0 ? [games[0].name] : [],
      rank: '',
      bio: '',
      achievements: [''],
      socialLinks: {
        twitter: '',
        instagram: '',
        twitch: '',
        youtube: '',
        discord: ''
      }
    });
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Handle toggling a single member selection
  const toggleMemberSelection = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) 
        ? prev.filter(memberId => memberId !== id) 
        : [...prev, id]
    );
  };

  // Handle toggling all members selection
  const toggleAllMembers = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(member => member._id!));
    }
  };

  // Handle bulk delete of selected members
  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      
      // Delete each selected member
      for (const memberId of selectedMembers) {
        await memberService.deleteMember(memberId);
      }
      
      // Update local state
      setMembers(members.filter(member => !selectedMembers.includes(member._id!)));
      
      // Show success message
      const successMessage = `${selectedMembers.length} members have been successfully deleted`;
      setSuccess(successMessage);
      
      // Clear selected members
      setSelectedMembers([]);
      
      // Close modal
      setShowBulkDeleteModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Refresh members list after a short delay
      setTimeout(async () => {
        try {
          const refreshedMembers = await memberService.getAllMembers();
          setMembers(refreshedMembers);
        } catch (err) {
          console.error('Error refreshing members:', err);
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to delete members');
      console.error('Error deleting members:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get image URL
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return `https://placehold.co/100/8A2BE2/FFFFFF?text=TW`;
    return uploadService.getImageUrl(imagePath);
  };

  // Helper functions for dynamic form fields based on role
  const shouldShowField = (fieldName: string): boolean => {
    switch (formData.role) {
      case 'Player':
        return ['primaryGame', 'secondaryGames', 'rank', 'bio', 'achievements'].includes(fieldName);
      case 'Coach':
        return ['primaryGame', 'secondaryGames', 'rank', 'bio', 'achievements'].includes(fieldName);
      case 'Content Creator':
        return ['bio', 'achievements', 'socialLinks'].includes(fieldName);
      case 'Social Media Manager':
        return ['bio', 'socialLinks'].includes(fieldName);
      default:
        return true;
    }
  };

  const getFieldLabel = (fieldName: string): string => {
    switch (formData.role) {
      case 'Player':
        switch (fieldName) {
          case 'primaryGame': return 'Primary Game';
          case 'secondaryGames': return 'Other Games';
          case 'rank': return 'In-Game Rank';
          case 'bio': return 'Player Bio';
          case 'achievements': return 'Player Achievements';
          default: return fieldName;
        }
      case 'Coach':
        switch (fieldName) {
          case 'primaryGame': return 'Coaching Game';
          case 'secondaryGames': return 'Other Games';
          case 'rank': return 'Coaching Experience';
          case 'bio': return 'Coach Bio';
          case 'achievements': return 'Coaching Achievements';
          default: return fieldName;
        }
      case 'Content Creator':
        switch (fieldName) {
          case 'bio': return 'Creator Bio';
          case 'achievements': return 'Content Achievements';
          case 'socialLinks': return 'Social Media Links';
          default: return fieldName;
        }
      case 'Social Media Manager':
        switch (fieldName) {
          case 'bio': return 'Manager Bio';
          case 'socialLinks': return 'Social Media Links';
          default: return fieldName;
        }
      default:
        return fieldName;
    }
  };

  const getFieldPlaceholder = (fieldName: string): string => {
    switch (formData.role) {
      case 'Player':
        switch (fieldName) {
          case 'rank': return 'e.g., Global Elite, Immortal, Diamond';
          case 'bio': return 'Tell us about your gaming experience and achievements...';
          case 'achievements': return 'e.g., Tournament Winner, Rank 1, MVP';
          default: return '';
        }
      case 'Coach':
        switch (fieldName) {
          case 'rank': return 'e.g., 5 years coaching experience, Former pro player';
          case 'bio': return 'Tell us about your coaching philosophy and experience...';
          case 'achievements': return 'e.g., Team Championship, Player Development Award';
          default: return '';
        }
      case 'Content Creator':
        switch (fieldName) {
          case 'bio': return 'Tell us about your content creation journey...';
          case 'achievements': return 'e.g., 100K subscribers, Featured Creator, Brand Collaborations';
          default: return '';
        }
      case 'Social Media Manager':
        switch (fieldName) {
          case 'bio': return 'Tell us about your social media management experience...';
          default: return '';
        }
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Members Management</h1>
          <div className="flex space-x-3">
            {selectedMembers.length > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Selected ({selectedMembers.length})
              </button>
            )}
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-neon-pink text-white px-4 py-2 rounded-md hover:bg-neon-pink/90 transition-colors"
            >
              Add New Member
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-white p-4 rounded-md mb-4">
            <p>{success}</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && !showAddModal && !showEditModal && !showDeleteModal && !showBulkDeleteModal && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-pink"></div>
          </div>
        )}

        {/* Members table */}
        {!loading && members.length === 0 ? (
          <div className="bg-dark-purple-light rounded-lg border border-neon-pink/20 p-8 text-center">
            <p className="text-white">No members found. Create your first member!</p>
          </div>
        ) : (
          <div className="bg-dark-purple-light rounded-lg border border-neon-pink/20 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-pink/20 bg-dark-purple/50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-3 w-3 text-neon-pink focus:ring-neon-pink/30 border-gray-700 rounded"
                          checked={selectedMembers.length === members.length && members.length > 0}
                          onChange={toggleAllMembers}
                        />
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Member</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Primary Game</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Secondary Games</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Join Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neon-pink/20">
                  {members.map((member, index) => (
                    <tr 
                      key={member._id} 
                      className={`hover:bg-neon-pink/5 transition-colors duration-200 ${index % 2 === 0 ? 'bg-dark-purple/30' : 'bg-dark-purple/20'}`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-3 w-3 text-neon-pink focus:ring-neon-pink/30 border-gray-700 rounded"
                          checked={selectedMembers.includes(member._id!)}
                          onChange={() => toggleMemberSelection(member._id!)}
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          {member.avatar ? (
                            <img 
                              src={getImageUrl(member.avatar)} 
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover mr-2 shadow-lg transition-transform duration-300 hover:scale-110" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2 shadow-lg">
                              👤
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-white">
                              {String(member.fullName || '-')}
                            </div>
                            <div className="text-xs text-gray-400">@{String(member.username || '-')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-white">{String(member.role || '-')}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-white">{String(member.primaryGame || '-')}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {member.secondaryGames && member.secondaryGames.map((game, index) => (
                            <span key={index} className="text-xs bg-dark-purple px-2 py-0.5 rounded text-white shadow-md">
                              {String(game || '-')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-white">{member.joinDate ? formatDate(member.joinDate) : '-'}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-neon-pink hover:text-neon-pink/80 transition-colors duration-200"
                            onClick={() => initEditForm(member)}
                          >
                            Edit
                          </button>
                          <button 
                            className="text-red-500 hover:text-red-400 transition-colors duration-200"
                            onClick={() => confirmDeleteMember(member._id!, member.fullName)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && memberToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-dark-purple w-full max-w-md rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 modal-content">
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
                    Are you sure you want to delete the member "{memberToDelete.name}"?
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
                    onClick={handleDeleteMember}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete Member'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-dark-purple w-full max-w-3xl rounded-lg shadow-lg overflow-hidden max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 overflow-y-auto max-h-[90vh] modal-content">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Member</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                {/* Add Member Form */}
                <form onSubmit={handleAddMember}>
                  {/* Form Grids & Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-4">Basic Information</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Avatar</label>
                        <ImageUploadWithCropper
                          initialImage={formData.avatar}
                          onImageUpload={(imagePath) => {
                            setFormData({
                              ...formData,
                              avatar: imagePath
                            });
                          }}
                          placeholderText="Member Avatar"
                          className="w-full"
                          uploadType="member"
                          aspectRatio={1}
                        />
                      </div>
                      
                      {shouldShowField('primaryGame') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">{getFieldLabel('primaryGame')}</label>
                          <select
                            name="primaryGame"
                            value={formData.primaryGame}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                          >
                            <option value="">Select a game</option>
                            {games.map(game => (
                              <option key={game._id} value={game.name}>{game.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        >
                          <option value="Player">Player</option>
                          <option value="Coach">Coach</option>
                          <option value="Content Creator">Content Creator</option>
                          <option value="Social Media Manager">Social Media Manager</option>
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Join Date</label>
                        <input
                          type="date"
                          name="joinDate"
                          value={formData.joinDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        />
                      </div>
                    </div>
                    
                    {/* Additional Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-neon-pink mb-4">Additional Information</h3>
                      
                      {shouldShowField('secondaryGames') && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-300">{getFieldLabel('secondaryGames')}</label>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto pr-2 mb-2 games-container">
                            {formData.secondaryGames.map((game, index) => (
                              <div key={index} className="flex mb-2">
                                <input
                                  type="text"
                                  value={game}
                                  onChange={(e) => handleArrayInputChange(e, 'secondaryGames', index)}
                                  className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('secondaryGames', index)}
                                  className="ml-2 text-red-500 hover:text-red-400"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addArrayItem('secondaryGames')}
                            className="text-xs text-neon-pink hover:text-neon-pink/80 mt-1"
                          >
                            + Add Game
                          </button>
                        </div>
                      )}
                      
                      {shouldShowField('rank') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">{getFieldLabel('rank')}</label>
                          <input
                            type="text"
                            name="rank"
                            value={formData.rank}
                            onChange={handleInputChange}
                            placeholder={getFieldPlaceholder('rank')}
                            className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                          />
                        </div>
                      )}
                      
                      {shouldShowField('bio') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">{getFieldLabel('bio')}</label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder={getFieldPlaceholder('bio')}
                            rows={3}
                            className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Social Links & Achievements */}
                  <div className="mt-4 mb-6">
                    {shouldShowField('achievements') && (
                      <>
                        <h3 className="text-lg font-semibold text-neon-pink mb-4">{getFieldLabel('achievements')}</h3>
                        
                        <div className="max-h-48 overflow-y-auto pr-2 mb-2 achievements-container">
                          {formData.achievements.map((achievement, index) => (
                            <div key={index} className="flex mb-2">
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => handleArrayInputChange(e, 'achievements', index)}
                                placeholder={getFieldPlaceholder('achievements')}
                                className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                              />
                              <button
                                type="button"
                                onClick={() => removeArrayItem('achievements', index)}
                                className="ml-2 text-red-500 hover:text-red-400"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addArrayItem('achievements')}
                          className="text-xs text-neon-pink hover:text-neon-pink/80 mt-1"
                        >
                          + Add Achievement
                        </button>
                      </>
                    )}
                    
                    {shouldShowField('socialLinks') && (
                      <>
                        <h3 className="text-lg font-semibold text-neon-purple mb-4">{getFieldLabel('socialLinks')}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                            <input
                              type="url"
                              name="socialLinks.twitter"
                              value={formData.socialLinks.twitter}
                              onChange={handleInputChange}
                              placeholder="https://twitter.com/username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                            <input
                              type="url"
                              name="socialLinks.instagram"
                              value={formData.socialLinks.instagram}
                              onChange={handleInputChange}
                              placeholder="https://instagram.com/username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitch</label>
                            <input
                              type="url"
                              name="socialLinks.twitch"
                              value={formData.socialLinks.twitch}
                              onChange={handleInputChange}
                              placeholder="https://twitch.tv/username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">YouTube</label>
                            <input
                              type="url"
                              name="socialLinks.youtube"
                              value={formData.socialLinks.youtube}
                              onChange={handleInputChange}
                              placeholder="https://youtube.com/@username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Discord</label>
                            <input
                              type="text"
                              name="socialLinks.discord"
                              value={formData.socialLinks.discord}
                              onChange={handleInputChange}
                              placeholder="username#1234"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-500 text-gray-300 rounded mr-2 hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neon-pink text-white rounded hover:bg-neon-pink/90"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Member Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-dark-purple w-full max-w-3xl rounded-lg shadow-lg overflow-hidden max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 overflow-y-auto max-h-[90vh] modal-content">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Member</h2>
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges && (
                      <span className="text-yellow-400 text-xs">Unsaved changes</span>
                    )}
                    <button
                      onClick={safeExitEditForm}
                      className="text-gray-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                </div>
                
                {/* Edit Member Form */}
                <form onSubmit={handleEditMember}>
                  {/* Form fields from Add Member Modal with the same structure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-neon-blue mb-4">Basic Information</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Avatar</label>
                        <ImageUploadWithCropper
                          initialImage={formData.avatar}
                          onImageUpload={(imagePath) => {
                            setFormData({
                              ...formData,
                              avatar: imagePath
                            });
                          }}
                          placeholderText="Member Avatar"
                          className="w-full"
                          uploadType="member"
                          aspectRatio={1}
                        />
                      </div>
                      
                      {shouldShowField('primaryGame') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">{getFieldLabel('primaryGame')}</label>
                          <select
                            name="primaryGame"
                            value={formData.primaryGame}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                          >
                            <option value="">Select a game</option>
                            {games.map(game => (
                              <option key={game._id} value={game.name}>{game.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                        >
                          <option value="Player">Player</option>
                          <option value="Coach">Coach</option>
                          <option value="Content Creator">Content Creator</option>
                          <option value="Social Media Manager">Social Media Manager</option>
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Join Date</label>
                        <input
                          type="date"
                          name="joinDate"
                          value={formData.joinDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                        />
                      </div>
                    </div>
                    
                    {/* Additional Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-neon-blue mb-4">Additional Information</h3>
                      
                      {shouldShowField('secondaryGames') && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-300">{getFieldLabel('secondaryGames')}</label>
                          </div>
                          
                          <div className="max-h-48 overflow-y-auto pr-2 mb-2 games-container">
                            {formData.secondaryGames.map((game, index) => (
                              <div key={index} className="flex mb-2">
                                <input
                                  type="text"
                                  value={game}
                                  onChange={(e) => handleArrayInputChange(e, 'secondaryGames', index)}
                                  className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeArrayItem('secondaryGames', index)}
                                  className="ml-2 text-red-500 hover:text-red-400"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => addArrayItem('secondaryGames')}
                            className="text-xs text-neon-blue hover:text-neon-blue/80 mt-1"
                          >
                            + Add Game
                          </button>
                        </div>
                      )}
                      
                      {shouldShowField('rank') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">{getFieldLabel('rank')}</label>
                          <input
                            type="text"
                            name="rank"
                            value={formData.rank}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                          />
                        </div>
                      )}
                      
                      {shouldShowField('bio') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">{getFieldLabel('bio')}</label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Social Links & Achievements */}
                  <div className="mt-4 mb-6">
                    {shouldShowField('achievements') && (
                      <>
                        <h3 className="text-lg font-semibold text-neon-blue mb-4">{getFieldLabel('achievements')}</h3>
                        
                        <div className="max-h-48 overflow-y-auto pr-2 mb-2 achievements-container">
                          {formData.achievements.map((achievement, index) => (
                            <div key={index} className="flex mb-2">
                              <input
                                type="text"
                                value={achievement}
                                onChange={(e) => handleArrayInputChange(e, 'achievements', index)}
                                className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                              />
                              <button
                                type="button"
                                onClick={() => removeArrayItem('achievements', index)}
                                className="ml-2 text-red-500 hover:text-red-400"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => addArrayItem('achievements')}
                          className="text-xs text-neon-blue hover:text-neon-blue/80 mt-1"
                        >
                          + Add Achievement
                        </button>
                      </>
                    )}
                    
                    {shouldShowField('socialLinks') && (
                      <>
                        <h3 className="text-lg font-semibold text-neon-blue mb-4">{getFieldLabel('socialLinks')}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                            <input
                              type="url"
                              name="socialLinks.twitter"
                              value={formData.socialLinks.twitter}
                              onChange={handleInputChange}
                              placeholder="https://twitter.com/username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                            <input
                              type="url"
                              name="socialLinks.instagram"
                              value={formData.socialLinks.instagram}
                              onChange={handleInputChange}
                              placeholder="https://instagram.com/username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Twitch</label>
                            <input
                              type="url"
                              name="socialLinks.twitch"
                              value={formData.socialLinks.twitch}
                              onChange={handleInputChange}
                              placeholder="https://twitch.tv/username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">YouTube</label>
                            <input
                              type="url"
                              name="socialLinks.youtube"
                              value={formData.socialLinks.youtube}
                              onChange={handleInputChange}
                              placeholder="https://youtube.com/@username"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Discord</label>
                            <input
                              type="text"
                              name="socialLinks.discord"
                              value={formData.socialLinks.discord}
                              onChange={handleInputChange}
                              placeholder="username#1234"
                              className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={safeExitEditForm}
                      className="px-4 py-2 border border-gray-500 text-gray-300 rounded mr-2 hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neon-blue text-white rounded hover:bg-neon-blue/90"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Update Member'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Exit Confirmation Modal */}
        {showExitConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
            <motion.div
              className="bg-dark-purple w-full max-w-md rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Unsaved Changes</h2>
                <p className="text-gray-300 mb-6">
                  You have unsaved changes. Are you sure you want to exit without saving?
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowExitConfirmation(false)}
                    className="px-4 py-2 border border-gray-500 text-gray-300 rounded hover:bg-gray-700"
                  >
                    Resume Editing
                  </button>
                  <button
                    onClick={confirmExitWithoutSaving}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Discard Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-red-500">Bulk Delete Members</h2>
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="bg-dark-purple p-4 rounded border border-gray-700 mb-6">
                <p className="text-white text-lg font-bold mb-2">
                  Delete {selectedMembers.length} members
                </p>
                <p className="text-gray-300">
                  Are you sure you want to delete these {selectedMembers.length} members? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-5 py-2 bg-transparent border border-gray-700 text-white hover:bg-gray-800 transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors rounded"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : `Delete ${selectedMembers.length} Members`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMembersPage; 