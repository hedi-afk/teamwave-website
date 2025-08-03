import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import gameService, { IGame, GameFormData } from '../../services/gameService';

const GamesPage: React.FC = () => {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentGame, setCurrentGame] = useState<IGame | null>(null);
  
  // Form state for adding/editing games
  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    featured: false,
    order: 0
  });

  // Fetch games from API
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const gamesData = await gameService.getAllGames();
      setGames(gamesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setError('Failed to fetch games. Please check the API connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const newGame = await gameService.createGame({
        ...formData,
        order: games.length
      });
      
      setGames([...games, newGame]);
      setSuccess(`Game "${newGame.name}" was successfully created!`);
      setTimeout(() => setSuccess(null), 3000);
      
      resetForm();
      setShowAddModal(false);
      
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentGame?._id) return;
    
    try {
      setLoading(true);
      
      const updatedGame = await gameService.updateGame(currentGame._id, formData);
      
      setGames(games.map(game => game._id === currentGame._id ? updatedGame : game));
      setSuccess(`Game "${updatedGame.name}" was successfully updated!`);
      setTimeout(() => setSuccess(null), 3000);
      
      setShowEditModal(false);
      setCurrentGame(null);
      resetForm();
      
    } catch (err: any) {
      console.error('Error updating game:', err);
      setError(err.response?.data?.message || 'Failed to update game');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteGame = (id: string, name: string) => {
    setGameToDelete({ id, name });
    setShowDeleteModal(true);
  };
  
  const handleDeleteGame = async () => {
    if (!gameToDelete) return;
    
    try {
      setLoading(true);
      
      await gameService.deleteGame(gameToDelete.id);
      
      setGames(games.filter(game => game._id !== gameToDelete.id));
      setSuccess(`Game "${gameToDelete.name}" has been successfully deleted`);
      setTimeout(() => setSuccess(null), 3000);
      
      setShowDeleteModal(false);
      setGameToDelete(null);
      
    } catch (err: any) {
      console.error('Error deleting game:', err);
      setError(err.response?.data?.message || 'Failed to delete game');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setGameToDelete(null);
  };

  const initEditForm = (game: IGame) => {
    setCurrentGame(game);
    setFormData({
      name: game.name,
      featured: game.featured,
      order: game.order
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      featured: false,
      order: 0
    });
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(games);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setGames(updatedItems);

    try {
      // Send updated order to backend
      await gameService.updateGameOrder(
        updatedItems.map((item, index) => ({
          id: item._id,
          order: index
        }))
      );
    } catch (err) {
      console.error('Error updating game order:', err);
      setError('Failed to save game order');
    }
  };

  // Simple dark background to match other boxes
  const getGameBackground = () => {
    return 'bg-dark-purple/30 border border-gray-700';
  };

  return (
    <div className="min-h-screen bg-retro-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-pixel text-white mb-2">Games Management</h1>
            <p className="text-gray-400">Manage your featured games and their display order</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="pixel-btn bg-neon-pink text-white hover:bg-neon-pink/80 transition-colors"
          >
            Add New Game
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
            <div className="text-neon-purple text-xl font-pixel">LOADING GAMES...</div>
          </div>
        )}

        {/* Games List */}
        {!loading && !error && (
          <div className="bg-dark-purple/30 rounded-lg p-6">
            <h2 className="text-xl font-pixel text-white mb-4">Games List (Drag to reorder)</h2>
            
            {games.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-300 text-lg">No games found. Create your first game!</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="games">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {games.map((game, index) => (
                        <Draggable key={game._id} draggableId={game._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`arcade-card overflow-hidden rounded-lg cursor-move ${
                                snapshot.isDragging ? 'shadow-2xl scale-105' : ''
                              }`}
                            >
                                                                                                                                                                                         <motion.div
                                   className={`h-48 ${getGameBackground()} relative group`}
                                   whileHover={{ scale: 1.02 }}
                                 >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <h3 className="text-2xl font-pixel text-white text-center px-4">
                                      {game.name}
                                    </h3>
                                  </div>
                                
                                {/* Featured Badge */}
                                {game.featured && (
                                  <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 text-xs rounded bg-yellow-500/90 text-black font-bold">
                                      FEATURED
                                    </span>
                                  </div>
                                )}
                                
                                {/* Order Badge */}
                                <div className="absolute bottom-3 left-3">
                                  <span className="px-2 py-1 text-xs rounded bg-black/50 text-white">
                                    #{game.order + 1}
                                  </span>
                                </div>
                                
                                                                 
                                 
                                 {/* Action Buttons */}
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        initEditForm(game);
                                      }}
                                      className="px-3 py-1 bg-neon-pink text-white rounded text-sm hover:bg-neon-pink/80 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDeleteGame(game._id, game.name);
                                      }}
                                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}

        {/* Add Game Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-dark-purple w-full max-w-md rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Game</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleAddGame}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Game Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-pink focus:ring-1 focus:ring-neon-pink"
                        placeholder="Enter game name"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-300">Featured Game</label>
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
                      {loading ? 'Creating...' : 'Create Game'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Game Modal */}
        {showEditModal && currentGame && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-dark-purple w-full max-w-md rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Game</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handleEditGame}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Game Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 bg-dark-purple border border-gray-700 rounded text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                        placeholder="Enter game name"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-300">Featured Game</label>
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
                      {loading ? 'Updating...' : 'Update Game'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && gameToDelete && (
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
                    Are you sure you want to delete the game "{gameToDelete.name}"?
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
                    onClick={handleDeleteGame}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete Game'}
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

export default GamesPage; 