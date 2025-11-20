import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TestUpload = () => {
  const [settings, setSettings] = useState({ organization_logo: null, club_logo: null });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time: timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog('🚀 Test Upload page loaded');
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      addLog('📡 Fetching current settings from backend...');
      const response = await axios.get(`${API}/settings`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      setSettings(response.data);
      addLog('✅ Settings fetched successfully', 'success');
      addLog(`Current organization_logo: ${response.data.organization_logo ? 'EXISTS' : 'NULL'}`);
      addLog(`Current club_logo: ${response.data.club_logo ? 'EXISTS' : 'NULL'}`);
    } catch (error) {
      addLog(`❌ Failed to fetch settings: ${error.message}`, 'error');
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('File terlalu besar! Maximum 2MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  };

  const handleOrganizationLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      addLog(`📁 File selected: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
      addLog('🔄 Converting to base64...');
      
      const base64 = await convertImageToBase64(file);
      
      addLog(`✅ Converted to base64 (length: ${base64.length} chars)`);
      addLog('💾 Updating state...');
      
      setSettings(prev => {
        const newSettings = { ...prev, organization_logo: base64 };
        addLog('✅ State updated with new logo', 'success');
        return newSettings;
      });
      
      toast.success('Logo selected! Click SAVE to upload');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      toast.error(error.message);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    addLog('💾 SAVE clicked - starting upload process...');

    try {
      // Log payload size
      const payload = {
        organization_logo: settings.organization_logo,
        club_logo: settings.club_logo,
        vision: '',
        mission: ''
      };
      
      addLog(`📦 Payload prepared:`);
      addLog(`  - organization_logo: ${payload.organization_logo ? `${payload.organization_logo.length} chars` : 'NULL'}`);
      addLog(`  - club_logo: ${payload.club_logo ? `${payload.club_logo.length} chars` : 'NULL'}`);

      addLog('📡 Sending POST request to backend...');
      
      const response = await axios.post(`${API}/settings`, payload);
      
      addLog('✅ Backend response received', 'success');
      addLog(`Response status: ${response.status}`);
      addLog(`Response data: ${JSON.stringify(response.data).substring(0, 100)}...`);

      toast.success('✅ Settings saved successfully!');
      
      addLog('🔄 Re-fetching settings to verify...');
      await fetchSettings();
      
      addLog('✅✅✅ SAVE COMPLETED SUCCESSFULLY!', 'success');
      
    } catch (error) {
      addLog(`❌ Save failed: ${error.message}`, 'error');
      addLog(`Error details: ${JSON.stringify(error.response?.data || error)}`, 'error');
      toast.error('Failed to save: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 TEST UPLOAD PAGE</h1>
        <p className="text-red-100">Isolated test environment untuk debug logo upload</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-500">
          <h2 className="text-2xl font-bold text-green-700 mb-4">📸 Upload Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Organization Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleOrganizationLogoUpload}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>

            {settings.organization_logo && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <img
                  src={settings.organization_logo}
                  alt="Preview"
                  className="h-32 w-32 object-contain border-4 border-green-500 rounded-lg bg-white p-2"
                />
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xl font-bold py-6 mt-6"
            >
              {loading ? '⏳ Saving...' : '💾 SAVE TO BACKEND'}
            </Button>
          </div>
        </div>

        {/* Right: Logs */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-2 border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">📋 Debug Logs</h2>
          <div className="h-96 overflow-y-auto space-y-2 font-mono text-sm">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-2 rounded ${
                  log.type === 'success'
                    ? 'bg-green-900/30 text-green-300'
                    : log.type === 'error'
                    ? 'bg-red-900/30 text-red-300'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                <span className="text-gray-500">[{log.time}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current State Display */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-700 mb-3">📊 Current State</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold text-gray-700">Organization Logo:</p>
            <p className="text-sm text-gray-600">
              {settings.organization_logo ? (
                <span className="text-green-600">✅ Loaded ({settings.organization_logo.length} chars)</span>
              ) : (
                <span className="text-red-600">❌ Not set</span>
              )}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Club Logo:</p>
            <p className="text-sm text-gray-600">
              {settings.club_logo ? (
                <span className="text-green-600">✅ Loaded ({settings.club_logo.length} chars)</span>
              ) : (
                <span className="text-red-600">❌ Not set</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUpload;
