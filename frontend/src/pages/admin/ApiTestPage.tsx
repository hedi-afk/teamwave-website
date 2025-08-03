import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const ApiTestPage: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [endpoint, setEndpoint] = useState('/news');

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log(`Testing API: ${config.apiUrl}${endpoint}`);
      const response = await axios.get(`${config.apiUrl}${endpoint}`);
      console.log('Response:', response.data);
      setResults(response.data);
    } catch (err: any) {
      console.error('API Test Error:', err);
      if (err.response) {
        setError(`Server responded with error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError(`No response received. Check if server is running at ${config.apiUrl}`);
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-neon-pink mb-8">API Test Page</h1>
        
        <div className="bg-dark-purple-light p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Test API Connection</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Endpoint (e.g., /news, /members)
            </label>
            <div className="flex">
              <div className="bg-dark-purple/90 text-gray-400 px-3 py-2 rounded-l-md border border-r-0 border-neon-purple/30">
                {config.apiUrl}
              </div>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-grow px-4 py-2 bg-dark-purple border border-neon-purple/30 rounded-r-md text-white"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <button
              onClick={testApi}
              disabled={loading}
              className="px-4 py-2 bg-neon-purple text-white rounded-md hover:bg-neon-purple/90 transition-colors"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-md mb-4">
              <h3 className="font-bold mb-2">Error</h3>
              <pre className="whitespace-pre-wrap text-sm">{error}</pre>
            </div>
          )}
          
          {results && (
            <div className="bg-green-500/20 border border-green-500/50 text-white p-4 rounded-md">
              <h3 className="font-bold mb-2">Success</h3>
              <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-dark-purple-light p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Current Configuration</h2>
          <pre className="bg-dark-purple/50 p-4 rounded-md text-sm overflow-auto text-white">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage; 