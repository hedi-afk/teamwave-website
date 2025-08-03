import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import partnerService, { IPartner } from '../../services/partnerService';
import uploadService from '../../services/uploadService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FallbackImage from '../../components/ui/FallbackImage';

const initialPartnerState: IPartner = {
  name: '',
  type: 'partner',
  tier: 'Platinum',
  logo: '',
  website: 'https://',
  description: '',
  active: true
};

const PartnersPage: React.FC = () => {
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'partner' | 'sponsor'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<IPartner>(initialPartnerState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch partners from the API
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partnerService.getAllPartners(undefined, false); // Get all partners, including inactive ones
      setPartners(data);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to load partners. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load partners on component mount
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Show success message for a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter partners based on the active tab
  const filteredItems = activeTab === 'all'
    ? partners
    : partners.filter(item => item.type === activeTab);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentPartner(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentPartner(prev => ({ ...prev, [name]: checked }));
  };

  // Handle logo file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Open the add partner modal
  const handleAddPartner = () => {
    setCurrentPartner(initialPartnerState);
    setLogoFile(null);
    setLogoPreview('');
    setShowAddModal(true);
  };

  // Open the edit partner modal
  const handleEditPartner = (partner: IPartner) => {
    setCurrentPartner(partner);
    setLogoPreview(partner.logo);
    setLogoFile(null);
    setShowEditModal(true);
  };

  // Open the delete confirmation modal
  const handleDeleteClick = (partner: IPartner) => {
    setCurrentPartner(partner);
    setShowDeleteModal(true);
  };

  // Handle partner deletion
  const handleDeletePartner = async () => {
    if (!currentPartner._id) return;
    
    try {
      setSaving(true);
      await partnerService.deletePartner(currentPartner._id);
      setSuccessMessage(`${currentPartner.name} has been deleted successfully.`);
      fetchPartners();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting partner:', err);
      setError('Failed to delete partner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle form submission for creating/updating a partner
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      let partnerToSave = { ...currentPartner };
      
      // If we have a new logo file, upload it first
      if (logoFile) {
        setUploading(true);
        try {
          const logoPath = await uploadService.uploadPartnerImage(logoFile);
          partnerToSave.logo = logoPath;
        } catch (err) {
          console.error('Error uploading logo:', err);
          setError('Failed to upload logo. Please try again with a smaller image.');
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }
      
      if (showAddModal) {
        // Create new partner
        const newPartner = await partnerService.createPartner(partnerToSave);
        setSuccessMessage(`${newPartner.name} has been added successfully.`);
      } else {
        // Update existing partner
        const updatedPartner = await partnerService.updatePartner(
          partnerToSave._id as string,
          partnerToSave
        );
        setSuccessMessage(`${updatedPartner.name} has been updated successfully.`);
      }
      
      // Clear form and close modal
      setCurrentPartner(initialPartnerState);
      setShowAddModal(false);
      setShowEditModal(false);
      setLogoFile(null);
      setLogoPreview('');
      
      // Refresh the partner list
      fetchPartners();
    } catch (err) {
      console.error('Error saving partner:', err);
      setError('Failed to save partner. Please check your inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neon-pink">Partners & Sponsors</h1>
          <button
            onClick={handleAddPartner}
            className="bg-neon-blue text-dark-purple px-4 py-2 rounded-md hover:bg-neon-blue/80 transition-colors"
          >
            Add New
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-md mb-6">
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-neon-purple text-dark-purple'
                : 'bg-dark-purple-light text-white hover:bg-neon-purple/40'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'partner'
                ? 'bg-neon-blue text-dark-purple'
                : 'bg-dark-purple-light text-white hover:bg-neon-blue/40'
            }`}
            onClick={() => setActiveTab('partner')}
          >
            Partners
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'sponsor'
                ? 'bg-neon-pink text-dark-purple'
                : 'bg-dark-purple-light text-white hover:bg-neon-pink/40'
            }`}
            onClick={() => setActiveTab('sponsor')}
          >
            Sponsors
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-purple-light p-6 rounded-lg border border-neon-purple/20">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Total Partners</h2>
            <p className="text-3xl font-bold text-neon-blue">
              {partners.filter(p => p.type === 'partner').length}
            </p>
          </div>
          <div className="bg-dark-purple-light p-6 rounded-lg border border-neon-purple/20">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">Total Sponsors</h2>
            <p className="text-3xl font-bold text-neon-pink">
              {partners.filter(p => p.type === 'sponsor').length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-purple"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-dark-purple-light rounded-lg border border-neon-purple/20 p-8 text-center">
            <p className="text-gray-400 mb-4">No partners or sponsors found.</p>
            <button
              onClick={handleAddPartner}
              className="bg-neon-blue text-dark-purple px-4 py-2 rounded-md hover:bg-neon-blue/80 transition-colors"
            >
              Add Your First Partner
            </button>
          </div>
        ) : (
          /* Partners/Sponsors Table */
          <div className="bg-dark-purple-light rounded-lg border border-neon-purple/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-purple/20">
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neon-purple/20">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-neon-purple/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-dark-purple flex items-center justify-center">
                            <FallbackImage
                              src={item.logo}
                              alt={item.name}
                              className="h-10 w-10 object-cover"
                              fallbackSrc="/images/placeholder.jpg"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{item.name}</div>
                            <div className="text-xs text-gray-400">{item.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === 'partner' ? 'bg-neon-blue/20 text-neon-blue' : 'bg-neon-pink/20 text-neon-pink'
                        }`}>
                          {item.type === 'partner' ? 'Partner' : 'Sponsor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{item.tier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={item.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-neon-blue hover:underline"
                        >
                          {new URL(item.website).hostname}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {item.partnerSince ? new Date(item.partnerSince).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.active ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-neon-blue hover:text-neon-blue/80 mr-3"
                          onClick={() => handleEditPartner(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteClick(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-purple-light p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-neon-blue mb-4">
                {showAddModal ? 'Add Partner/Sponsor' : 'Edit Partner/Sponsor'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={currentPartner.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Type</label>
                    <select
                      name="type"
                      value={currentPartner.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                    >
                      <option value="partner">Partner</option>
                      <option value="sponsor">Sponsor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Tier</label>
                    <select
                      name="tier"
                      value={currentPartner.tier}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                    >
                      <option value="Platinum">Platinum</option>
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Official">Official</option>
                      <option value="Major">Major</option>
                      <option value="Supporting">Supporting</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={currentPartner.website}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentPartner.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white h-24"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Long Description (Optional)</label>
                  <textarea
                    name="longDescription"
                    value={currentPartner.longDescription || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white h-24"
                    placeholder="Detailed description for the partner/sponsor detail page"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Founded Year (Optional)</label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={currentPartner.foundedYear || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                      placeholder="e.g. 2010"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Headquarters (Optional)</label>
                    <input
                      type="text"
                      name="headquarters"
                      value={currentPartner.headquarters || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Industry (Optional)</label>
                  <input
                    type="text"
                    name="industry"
                    value={currentPartner.industry || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                    placeholder="e.g. Gaming Hardware"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Partner Since</label>
                  <input
                    type="date"
                    name="partnerSince"
                    value={currentPartner.partnerSince 
                      ? new Date(currentPartner.partnerSince).toISOString().substr(0, 10)
                      : new Date().toISOString().substr(0, 10)
                    }
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Logo</label>
                  <div className="flex items-start space-x-4">
                    <div>
                      <label className="block px-4 py-2 bg-neon-blue text-dark-purple rounded-md cursor-pointer hover:bg-neon-blue/80 transition-colors text-center">
                        <span>Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {(logoFile || logoPreview) && (
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-dark-purple flex items-center justify-center">
                        <img
                          src={logoFile ? logoPreview : logoPreview}
                          alt="Logo Preview"
                          className="h-20 w-20 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={currentPartner.active}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-neon-purple/30 rounded"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-white">
                    Active
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-neon-purple/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 bg-dark-purple-light border border-neon-purple/30 text-white rounded-md hover:bg-dark-purple transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="px-4 py-2 bg-neon-blue text-dark-purple rounded-md hover:bg-neon-blue/80 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <ConfirmDialog
            title="Delete Partner"
            message={`Are you sure you want to delete ${currentPartner.name}? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDeletePartner}
            onCancel={() => setShowDeleteModal(false)}
            isLoading={saving}
            type="danger"
          />
        )}
      </div>
    </div>
  );
};

export default PartnersPage; 