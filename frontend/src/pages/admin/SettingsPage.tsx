import React, { useState } from 'react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  socialLinks: {
    twitter: string;
    discord: string;
    twitch: string;
    youtube: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string;
  };
  maintenanceMode: boolean;
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'TeamWave',
    siteDescription: 'Professional gaming and esports organization',
    contactEmail: 'contact@teamwave.com',
    socialLinks: {
      twitter: 'https://twitter.com/teamwave',
      discord: 'https://discord.gg/teamwave',
      twitch: 'https://twitch.tv/teamwave',
      youtube: 'https://youtube.com/teamwave'
    },
    seoSettings: {
      metaTitle: 'TeamWave | Gaming Organization',
      metaDescription: 'Professional gaming team and esports organization focused on CS:GO, Valorant, and League of Legends',
      ogImageUrl: '/images/og-image.jpg'
    },
    maintenanceMode: false
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects with dot notation in name
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings({
        ...settings,
        [parent]: {
          ...(settings[parent as keyof SiteSettings] as Record<string, string>),
          [child]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  const handleToggleChange = (name: string) => {
    setSettings({
      ...settings,
      [name]: !settings[name as keyof SiteSettings]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, here you would save settings to backend
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-300">Settings</h1>
        <button
          onClick={handleSubmit}
          className="bg-neon-green text-dark-purple px-4 py-2 rounded-md hover:bg-neon-green/90 transition-colors"
        >
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="bg-neon-green/20 border border-neon-green text-neon-green p-4 rounded-md mb-6">
          Settings saved successfully!
        </div>
      )}

      {/* Settings Tabs */}
      <div className="mb-6 border-b border-neon-purple/20">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 transition-colors ${
              activeTab === 'general'
                ? 'border-b-2 border-neon-purple text-neon-purple'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`px-4 py-2 transition-colors ${
              activeTab === 'social'
                ? 'border-b-2 border-neon-pink text-neon-pink'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('social')}
          >
            Social Media
          </button>
          <button
            className={`px-4 py-2 transition-colors ${
              activeTab === 'seo'
                ? 'border-b-2 border-neon-blue text-neon-blue'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
          <button
            className={`px-4 py-2 transition-colors ${
              activeTab === 'advanced'
                ? 'border-b-2 border-red-500 text-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-dark-purple-light p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-neon-purple mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Site Description</label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Social Media Settings */}
      {activeTab === 'social' && (
        <div className="bg-dark-purple-light p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-neon-pink mb-4">Social Media Links</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Twitter URL</label>
              <input
                type="url"
                name="socialLinks.twitter"
                value={settings.socialLinks.twitter}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Discord URL</label>
              <input
                type="url"
                name="socialLinks.discord"
                value={settings.socialLinks.discord}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Twitch URL</label>
              <input
                type="url"
                name="socialLinks.twitch"
                value={settings.socialLinks.twitch}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">YouTube URL</label>
              <input
                type="url"
                name="socialLinks.youtube"
                value={settings.socialLinks.youtube}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Settings */}
      {activeTab === 'seo' && (
        <div className="bg-dark-purple-light p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-neon-blue mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Meta Title</label>
              <input
                type="text"
                name="seoSettings.metaTitle"
                value={settings.seoSettings.metaTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Meta Description</label>
              <textarea
                name="seoSettings.metaDescription"
                value={settings.seoSettings.metaDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">OG Image URL</label>
              <input
                type="text"
                name="seoSettings.ogImageUrl"
                value={settings.seoSettings.ogImageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-md text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {activeTab === 'advanced' && (
        <div className="bg-dark-purple-light p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Advanced Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.maintenanceMode}
                    onChange={() => handleToggleChange('maintenanceMode')}
                  />
                  <div className={`block w-14 h-8 rounded-full ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.maintenanceMode ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-white font-medium">Maintenance Mode</div>
              </label>
            </div>
            <div className="bg-red-500/20 border border-red-500 rounded-md p-4 mt-4">
              <p className="text-white">
                <span className="font-bold">Warning:</span> When maintenance mode is enabled, the site will be inaccessible to regular users.
                Only administrators will be able to access the site.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage; 