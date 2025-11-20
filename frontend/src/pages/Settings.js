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
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', photo: null, video_url: '', video_file: null, team_id: null });
  const [submittingGallery, setSubmittingGallery] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      if (response.data) {
        // Merge with default values to ensure all fields exist
        setSettings(prev => ({
          ...prev,
          ...response.data,
          // Ensure these fields always exist
          organization_logo: response.data.organization_logo || prev.organization_logo,
          club_logo: response.data.club_logo || prev.club_logo,
          vision: response.data.vision || prev.vision || '',
          mission: response.data.mission || prev.mission || ''
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file, callback) => {
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
        setSettings(prev => ({ ...prev, organization_logo: compressedBase64 }));
        console.log('Organization logo updated in state');
      });
    }
  };

  const handleClubLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, (compressedBase64) => {
        setSettings(prev => ({ ...prev, club_logo: compressedBase64 }));
        console.log('Club logo updated in state');
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare data - ensure all fields are included
      const dataToSave = {
        organization_logo: settings.organization_logo || null,
        club_logo: settings.club_logo || null,
        login_logo: settings.login_logo || null,
        dashboard_logo: settings.dashboard_logo || null,
        footer_signature: settings.footer_signature || null,
        vision: settings.vision || '',
        mission: settings.mission || ''
      };
      
      console.log('=== SAVING SETTINGS ===');
      console.log('Organization logo length:', dataToSave.organization_logo ? dataToSave.organization_logo.length : 0);
      console.log('Club logo length:', dataToSave.club_logo ? dataToSave.club_logo.length : 0);
      
      const response = await axios.post(`${API}/settings`, dataToSave);
      console.log('Save response:', response.data);
      
      toast.success('Settings berhasil disimpan! Refresh dalam 2 detik...');
      
      // Force reload after 2 seconds
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.detail || 'Gagal menyimpan settings');
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

  const handleGalleryVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please upload a video file (MP4/WebM)');
        return;
      }
      
      // Show loading toast for large files
      const loadingToast = toast.loading(`Loading video (${(file.size / 1024 / 1024).toFixed(1)}MB)...`);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        toast.dismiss(loadingToast);
        setGalleryForm({ ...galleryForm, video_file: event.target.result });
        toast.success(`Video loaded! Size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      };
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error('Failed to read video file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.description || !galleryForm.photo) {
      toast.error('Please fill all fields and upload thumbnail');
      return;
    }
    
    if (!galleryForm.video_url && !galleryForm.video_file) {
      toast.error('Please provide either YouTube URL or upload MP4 video');
      return;
    }
    
    setSubmittingGallery(true);
    try {
      await axios.post(`${API}/match-gallery`, galleryForm);
      toast.success('Video added to gallery!');
      setGalleryForm({ title: '', description: '', photo: null, video_url: '', video_file: null, team_id: null });
    } catch (error) {
      toast.error('Failed to add video');
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
    <div data-testid="settings-page" className="pb-32">
      {/* Sticky Save Button at Top */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-green-700 to-green-800 shadow-2xl mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-yellow-300">⚙️ Settings</h2>
            <p className="text-sm text-yellow-100">Upload logo dan klik "Simpan" untuk update</p>
          </div>
          <Button
            data-testid="save-settings-top-btn"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 shadow-2xl px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed border-4 border-yellow-300"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              <>
                <Save className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                SIMPAN PENGATURAN
              </>
            )}
          </Button>
        </div>
      </div>

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
            
            {/* Save Button for Organization Logo */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg px-6 py-4 text-lg font-bold"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Logo Organisasi'}
              </Button>
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
            
            {/* Save Button for Club Logo */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg px-6 py-4 text-lg font-bold"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Logo Club'}
              </Button>
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
              <div className="mb-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('vision-textarea');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = settings.vision.substring(start, end);
                  const newText = settings.vision.substring(0, start) + `<b>${selectedText}</b>` + settings.vision.substring(end);
                  setSettings({ ...settings, vision: newText });
                }} className="text-xs"><b>B</b> Bold</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('vision-textarea');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = settings.vision.substring(start, end);
                  const newText = settings.vision.substring(0, start) + `<i>${selectedText}</i>` + settings.vision.substring(end);
                  setSettings({ ...settings, vision: newText });
                }} className="text-xs"><i>I</i> Italic</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('vision-textarea');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = settings.vision.substring(start, end);
                  const newText = settings.vision.substring(0, start) + `<h2>${selectedText}</h2>` + settings.vision.substring(end);
                  setSettings({ ...settings, vision: newText });
                }} className="text-xs">H2 Heading</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('vision-textarea');
                  const start = textarea.selectionStart;
                  const newText = settings.vision.substring(0, start) + `<p></p>` + settings.vision.substring(start);
                  setSettings({ ...settings, vision: newText });
                }} className="text-xs">¶ Paragraph</Button>
              </div>
              <textarea
                id="vision-textarea"
                value={settings.vision || ''}
                onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                placeholder="Masukkan visi organisasi..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all font-mono text-sm"
                rows="6"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Select text lalu klik tombol format di atas</p>
            </div>
            <div>
              <Label className="text-gray-700 font-semibold mb-2 block">Misi</Label>
              <div className="mb-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('mission-textarea');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = settings.mission.substring(start, end);
                  const newText = settings.mission.substring(0, start) + `<b>${selectedText}</b>` + settings.mission.substring(end);
                  setSettings({ ...settings, mission: newText });
                }} className="text-xs"><b>B</b> Bold</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('mission-textarea');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = settings.mission.substring(start, end);
                  const newText = settings.mission.substring(0, start) + `<i>${selectedText}</i>` + settings.mission.substring(end);
                  setSettings({ ...settings, mission: newText });
                }} className="text-xs"><i>I</i> Italic</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('mission-textarea');
                  const start = textarea.selectionStart;
                  const newText = settings.mission.substring(0, start) + `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>` + settings.mission.substring(start);
                  setSettings({ ...settings, mission: newText });
                }} className="text-xs">• List</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => {
                  const textarea = document.getElementById('mission-textarea');
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = settings.mission.substring(start, end);
                  const newText = settings.mission.substring(0, start) + `<h3>${selectedText}</h3>` + settings.mission.substring(end);
                  setSettings({ ...settings, mission: newText });
                }} className="text-xs">H3 Heading</Button>
              </div>
              <textarea
                id="mission-textarea"
                value={settings.mission || ''}
                onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                placeholder="Masukkan misi organisasi..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all font-mono text-sm"
                rows="8"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Select text lalu klik tombol format di atas</p>
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

        {/* PHOTO GALLERY Section - Upload Photos with Title & Description */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-2xl p-8 border-4 border-purple-400">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">📸 PHOTO GALLERY</h2>
              <p className="text-base text-purple-700 font-semibold">Upload Foto Kegiatan dengan Title dan Description</p>
              <p className="text-sm text-gray-600">Foto akan muncul di Dashboard Photo Gallery</p>
            </div>
          </div>
          <form onSubmit={handleVideoSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
              <Label className="text-purple-700 font-bold text-lg mb-2 block">📝 Title Foto Kegiatan *</Label>
              <Input
                type="text"
                value={galleryForm.title}
                onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                placeholder="Contoh: Turnamen Golf Manado 2025"
                className="mt-2 border-2 border-purple-300 focus:border-purple-500 text-lg"
                required
              />
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
              <Label className="text-purple-700 font-bold text-lg mb-2 block">📄 Description Kegiatan *</Label>
              <textarea
                value={galleryForm.description}
                onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                placeholder="Contoh: Kegiatan turnamen golf tahunan yang diikuti oleh semua anggota Manado Golf League..."
                className="mt-2 w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 text-base"
                rows="4"
                required
              />
            </div>
            <div>
              <Label className="text-gray-700 font-semibold">Video (Pilih salah satu)</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-sm text-gray-600">Opsi 1: YouTube URL</Label>
                  <Input
                    type="text"
                    value={galleryForm.video_url}
                    onChange={(e) => setGalleryForm({ ...galleryForm, video_url: e.target.value, video_file: null })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-1"
                  />
                </div>
                <div className="text-center text-gray-500 font-semibold">ATAU</div>
                <div>
                  <Label className="text-sm text-gray-600">Opsi 2: Upload Video MP4 (No Size Limit)</Label>
                  <p className="text-xs text-amber-600 mb-2">💡 Untuk 5 team opening videos - upload bebas tanpa batasan size</p>
                  <div className="mt-1 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
                    <Input
                      type="file"
                      accept="video/mp4,video/webm,video/avi,video/mov"
                      onChange={handleGalleryVideoUpload}
                      className="border-0 p-0"
                    />
                  </div>
                  {galleryForm.video_file && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">✓ Video file loaded (size: {(galleryForm.video_file.length / 1024 / 1024).toFixed(1)}MB)</p>
                      <p className="text-xs text-green-600 mt-1">Ready to upload! No size restrictions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
              <Label className="text-purple-700 font-bold text-lg mb-3 block">📷 Upload Foto Kegiatan * (WAJIB)</Label>
              <div className="mt-2 p-8 border-4 border-dashed border-purple-400 rounded-xl hover:border-purple-600 transition-colors bg-purple-50 cursor-pointer">
                <div className="text-center mb-4">
                  <p className="text-purple-700 font-bold text-lg">Klik atau Drag & Drop Foto di sini</p>
                  <p className="text-sm text-gray-600 mt-2">Format: JPG, PNG • Tidak ada batasan ukuran</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryPhotoUpload}
                  className="border-0 p-0 cursor-pointer"
                  required
                />
              </div>
              {galleryForm.photo && (
                <div className="mt-6 flex justify-center">
                  <div className="text-center">
                    <img 
                      src={galleryForm.photo} 
                      alt="Gallery Preview" 
                      className="h-64 w-auto object-contain rounded-xl border-4 border-purple-500 shadow-2xl" 
                    />
                    <p className="text-lg font-bold text-green-600 mt-3">✅ Preview Foto - Siap Upload!</p>
                  </div>
                </div>
              )}
            </div>
            <Button
              type="submit"
              disabled={submittingGallery || !galleryForm.photo || (!galleryForm.video_url && !galleryForm.video_file)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg py-6"
            >
              {submittingGallery ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading Team Opening Video...</span>
                </div>
              ) : (
                '🎬 Upload Team Opening Video'
              )}
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
