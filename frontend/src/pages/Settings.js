import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Upload, Save, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    dashboard_logo: '',
    footer_signature: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file, callback) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedBase64);
        toast.success('Gambar berhasil diupload');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setSettings({ ...settings, dashboard_logo: compressedBase64 });
      });
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setSettings({ ...settings, footer_signature: compressedBase64 });
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/settings`, settings);
      toast.success('Settings berhasil disimpan!');
      // Reload page to see changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error('Gagal menyimpan settings');
      setSaving(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Hanya admin yang dapat mengakses settings</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="settings-page">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Settings
        </h1>
        <p className="text-gray-600">Pengaturan aplikasi dan branding</p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-6">
        {/* Dashboard Logo */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Logo Dashboard</h2>
              <p className="text-sm text-gray-600">Logo utama yang ditampilkan di dashboard header</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2">Upload Logo Club</Label>
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <Input
                  data-testid="dashboard-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="border-0 p-0"
                />
              </div>
              {settings.dashboard_logo && (
                <div className="mt-4 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={settings.dashboard_logo} 
                      alt="Dashboard Logo" 
                      className="h-32 w-32 object-contain rounded-xl border-4 border-yellow-400 shadow-lg bg-white p-2" 
                    />
                    <p className="text-sm text-gray-600 mt-2">Preview Logo Dashboard</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Signature Footer</h2>
              <p className="text-sm text-gray-600">Logo/signature di footer "Created By Onedhee 2025"</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2">Upload Signature/Logo</Label>
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <Input
                  data-testid="footer-signature-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="border-0 p-0"
                />
              </div>
              {settings.footer_signature && (
                <div className="mt-4 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={settings.footer_signature} 
                      alt="Footer Signature" 
                      className="h-20 w-auto object-contain rounded-lg border-2 border-yellow-400 shadow-md bg-gray-800 p-2" 
                    />
                    <p className="text-sm text-gray-600 mt-2">Preview Signature Footer</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            data-testid="save-settings-btn"
            onClick={handleSave}
            className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg px-8 py-6 text-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            Simpan Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
