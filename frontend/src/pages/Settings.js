import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Upload, Save, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    dashboard_logo: null,
    organization_logo: null,
    club_logo: null,
    footer_signature: null,
    login_logo: null,
    vision: '',
    mission: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Announcements state
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  
  // Gallery state
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', photo: null, video_url: '', team_id: null });
  const [submittingGallery, setSubmittingGallery] = useState(false);

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

  const handleLoginLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setSettings({ ...settings, login_logo: compressedBase64 });
      });
    }
  };

  const handleOrganizationLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setSettings({ ...settings, organization_logo: compressedBase64 });
      });
    }
  };

  const handleClubLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setSettings({ ...settings, club_logo: compressedBase64 });
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving settings:', settings);
      const response = await axios.post(`${API}/settings`, settings);
      console.log('Save response:', response.data);
      toast.success('Settings berhasil disimpan!');
      // Reload page to see changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Gagal menyimpan settings: ${error.response?.data?.detail || error.message}`);
      setSaving(false);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      toast.error('Please fill all fields');
      return;
    }
    
    setSubmittingAnnouncement(true);
    try {
      await axios.post(`${API}/announcements`, announcementForm);
      toast.success('Announcement added successfully!');
      setAnnouncementForm({ title: '', content: '' });
    } catch (error) {
      toast.error('Failed to add announcement');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const handleGalleryPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setGalleryForm({ ...galleryForm, photo: compressedBase64 });
      });
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.description || !galleryForm.photo) {
      toast.error('Please fill all fields and upload a photo');
      return;
    }
    
    setSubmittingGallery(true);
    try {
      await axios.post(`${API}/match-gallery`, galleryForm);
      toast.success('Gallery item added successfully!');
      setGalleryForm({ title: '', description: '', photo: null, video_url: '', team_id: null });
    } catch (error) {
      toast.error('Failed to add gallery item');
    } finally {
      setSubmittingGallery(false);
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
        {/* Organization Logo (Dashboard Kiri + Sidebar) */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Logo Organisasi</h2>
              <p className="text-sm text-gray-600">Ditampilkan di dashboard (kiri) dan sidebar menu</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2">Upload Logo Organisasi</Label>
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <Input
                  data-testid="organization-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleOrganizationLogoUpload}
                  className="border-0 p-0"
                />
              </div>
              {settings.organization_logo && (
                <div className="mt-4 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={settings.organization_logo} 
                      alt="Organization Logo" 
                      className="h-32 w-32 object-contain rounded-xl border-4 border-green-400 shadow-lg bg-white p-2" 
                    />
                    <p className="text-sm text-gray-600 mt-2">Preview Logo Organisasi</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Club Logo (Dashboard Kanan) */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Logo Club</h2>
              <p className="text-sm text-gray-600">Ditampilkan di dashboard (kanan)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2">Upload Logo Club</Label>
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <Input
                  data-testid="club-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleClubLogoUpload}
                  className="border-0 p-0"
                />
              </div>
              {settings.club_logo && (
                <div className="mt-4 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={settings.club_logo} 
                      alt="Club Logo" 
                      className="h-32 w-32 object-contain rounded-xl border-4 border-yellow-400 shadow-lg bg-white p-2" 
                    />
                    <p className="text-sm text-gray-600 mt-2">Preview Logo Club</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Login Logo */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Logo Login Page</h2>
              <p className="text-sm text-gray-600">Logo yang ditampilkan di halaman login</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2">Upload Logo Login</Label>
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                <Input
                  data-testid="login-logo-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLoginLogoUpload}
                  className="border-0 p-0"
                />
              </div>
              {settings.login_logo && (
                <div className="mt-4 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={settings.login_logo} 
                      alt="Login Logo" 
                      className="h-32 w-32 object-contain rounded-xl border-4 border-blue-400 shadow-lg bg-white p-2" 
                    />
                    <p className="text-sm text-gray-600 mt-2">Preview Logo Login</p>
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

        {/* Visi & Misi Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Visi & Misi</h2>
              <p className="text-sm text-gray-600">Edit visi dan misi organisasi (akan tampil di dashboard)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">Visi</Label>
              <ReactQuill
                value={settings.vision || ''}
                onChange={(content) => setSettings({ ...settings, vision: content })}
                placeholder="Masukkan visi organisasi..."
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['clean']
                  ]
                }}
                style={{ height: '150px', marginBottom: '50px' }}
              />
            </div>
            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">Misi</Label>
              <ReactQuill
                value={settings.mission || ''}
                onChange={(content) => setSettings({ ...settings, mission: content })}
                placeholder="Masukkan misi organisasi..."
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['clean']
                  ]
                }}
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </div>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add Announcement</h2>
              <p className="text-sm text-gray-600">Create announcements for dashboard running text</p>
            </div>
          </div>
          <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold">Title</Label>
              <Input
                type="text"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="Announcement title"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-700 font-semibold">Content</Label>
              <textarea
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                placeholder="Announcement content"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            <Button
              type="submit"
              disabled={submittingAnnouncement}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {submittingAnnouncement ? 'Adding...' : 'Add Announcement'}
            </Button>
          </form>
        </div>

        {/* Gallery Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add Gallery Photo</h2>
              <p className="text-sm text-gray-600">Upload match photos with description</p>
            </div>
          </div>
          <form onSubmit={handleGallerySubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 font-semibold">Title</Label>
              <Input
                type="text"
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                placeholder="Photo title"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-700 font-semibold">Description</Label>
              <textarea
                value={galleryForm.description}
                onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                placeholder="Photo description"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            <div>
              <Label className="text-gray-700 font-semibold">Video URL (Optional)</Label>
              <Input
                type="text"
                value={galleryForm.video_url}
                onChange={(e) => setGalleryForm({ ...galleryForm, video_url: e.target.value })}
                placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Jika diisi, logo akan bisa diklik untuk play video (team opening)</p>
            </div>
            <div>
              <Label className="text-gray-700 font-semibold">Upload Photo</Label>
              <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryPhotoUpload}
                  className="border-0 p-0"
                />
              </div>
              {galleryForm.photo && (
                <div className="mt-4 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={galleryForm.photo} 
                      alt="Gallery Preview" 
                      className="h-48 w-auto object-contain rounded-lg border-4 border-purple-400 shadow-lg" 
                    />
                    <p className="text-sm text-gray-600 mt-2">Preview Photo</p>
                  </div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={submittingGallery}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            >
              {submittingGallery ? 'Adding...' : 'Add to Gallery'}
            </Button>
          </form>
        </div>

        {/* Save Logo Settings Button */}
        <div className="flex justify-end">
          <Button
            data-testid="save-settings-btn"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg px-8 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-300"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Logo Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
