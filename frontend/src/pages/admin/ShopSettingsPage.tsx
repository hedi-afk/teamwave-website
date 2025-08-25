import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getShopSettings, updateShopSettings, ShopSettings } from '../../services/shopSettingsService';

const ShopSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    isActive: true,
    maintenanceMessage: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getShopSettings();
      setSettings(data);
      setFormData({
        isActive: data.isActive,
        maintenanceMessage: data.maintenanceMessage || '',
      });
      setError('');
    } catch (error: any) {
      setError('Failed to load shop settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateShopSettings(formData);
      setSuccess('Shop settings updated successfully!');
      fetchSettings(); // Refresh settings
    } catch (error: any) {
      setError('Failed to update shop settings');
      console.error('Error updating settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  if (loading) {
    return (
      <div className="bg-retro-black min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-neon-purple text-xl font-pixel">LOADING SETTINGS...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-retro-black min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-pixel text-yellow-400 mb-2">SHOP SETTINGS</h1>
          <p className="text-gray-300">Control shop visibility and maintenance messages</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="arcade-card p-4 mb-6 border-neon-red">
            <div className="text-neon-red text-center">{error}</div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="arcade-card p-4 mb-6 border-neon-green">
            <div className="text-neon-green text-center">{success}</div>
          </div>
        )}

        {/* Settings Form */}
        <div className="arcade-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-dark-purple/30 rounded-lg">
              <div>
                <h3 className="text-lg font-pixel text-white mb-1">SHOP STATUS</h3>
                <p className="text-gray-300 text-sm">
                  {formData.isActive 
                    ? 'Shop is currently visible to customers' 
                    : 'Shop is currently hidden from customers'
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-neon-purple focus:ring-offset-2 focus:ring-offset-dark-purple ${
                  formData.isActive ? 'bg-neon-green' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-12' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Maintenance Message */}
            <div>
              <label className="block text-neon-purple font-pixel text-sm mb-2">
                MAINTENANCE MESSAGE
              </label>
              <textarea
                value={formData.maintenanceMessage}
                onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                className="w-full bg-dark-purple/50 border-2 border-neon-purple text-white px-3 py-2 rounded-lg focus:outline-none focus:border-neon-pink resize-none"
                placeholder="Enter maintenance message to display when shop is disabled..."
                rows={4}
              />
              <p className="text-gray-400 text-xs mt-1">
                This message will be displayed to customers when the shop is disabled
              </p>
            </div>

            {/* Current Status Display */}
            {settings && (
              <div className="p-4 bg-dark-purple/20 rounded-lg">
                <h4 className="text-neon-purple font-pixel text-sm mb-2">CURRENT STATUS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-300">Status:</span>
                    <span className={`ml-2 font-pixel ${settings.isActive ? 'text-neon-green' : 'text-neon-red'}`}>
                      {settings.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Last Updated:</span>
                    <span className="ml-2 text-white">
                      {new Date(settings.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={fetchSettings}
                className="flex-1 pixel-btn border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white"
                disabled={saving}
              >
                REFRESH
              </button>
              <button
                type="submit"
                className="flex-1 pixel-btn bg-neon-purple text-white hover:bg-white hover:text-dark-purple"
                disabled={saving}
              >
                {saving ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="arcade-card p-6 mt-6">
          <h3 className="text-lg font-pixel text-neon-purple mb-4">PREVIEW</h3>
          <div className="bg-dark-purple/30 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-neon-yellow text-2xl font-pixel mb-4">SHOP MAINTENANCE</div>
              <p className="text-gray-300 text-lg mb-4">
                {formData.maintenanceMessage || 'Shop is currently under maintenance. Please check back later.'}
              </p>
              <div className="text-neon-purple text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettingsPage;
