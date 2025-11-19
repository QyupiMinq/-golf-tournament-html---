import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Users, UserCheck, CalendarDays, Trophy, TrendingUp, Trash2, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState({ organization_logo: null, club_logo: null, vision: null, mission: null });
  const [announcements, setAnnouncements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSettings();
    fetchAnnouncements();
    fetchGallery();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API}/announcements`);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API}/match-gallery`);
      setGallery(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    }
  };

  const handleDeleteGallery = async (itemId) => {
    if (!window.confirm('Hapus foto ini dari gallery?')) return;
    
    try {
      await axios.delete(`${API}/match-gallery/${itemId}`);
      toast.success('Gallery item deleted successfully!');
      fetchGallery(); // Refresh gallery
    } catch (error) {
      toast.error('Failed to delete gallery item');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Hapus announcement ini?')) return;
    
    try {
      await axios.delete(`${API}/announcements/${announcementId}`);
      toast.success('Announcement deleted successfully!');
      fetchAnnouncements(); // Refresh announcements
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const statCards = stats
    ? [
        { icon: Users, label: 'Total Teams', value: stats.teams_count, color: 'bg-gradient-to-br from-green-600 to-green-700' },
        { icon: UserCheck, label: 'Total Players', value: stats.players_count, color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
        { icon: CalendarDays, label: 'Total Matches', value: stats.matches_count, color: 'bg-gradient-to-br from-gray-600 to-gray-700' },
        { icon: Trophy, label: 'Completed', value: stats.completed_matches, color: 'bg-gradient-to-br from-green-700 to-green-800' },
        { icon: TrendingUp, label: 'Pending', value: stats.pending_matches, color: 'bg-gradient-to-br from-yellow-600 to-yellow-700' },
      ]
    : [];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-gray-800 via-green-800 to-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent"></div>
        
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* Logo Organisasi (Kiri) */}
            {settings.organization_logo ? (
              <img src={settings.organization_logo} alt="Organization Logo" className="h-24 w-24 object-contain rounded-xl shadow-lg bg-white/10 p-2" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg border-4 border-green-500/30">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            )}
            
            <div>
              <h1
                className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 mb-2"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                MANADO GOLF LEAGUE
              </h1>
              <p className="text-yellow-200 font-semibold tracking-widest text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                ONE SPIRIT - ONE FAIRWAY
              </p>
            </div>
            
            {/* Logo Club (Kanan) */}
            {settings.club_logo ? (
              <img src={settings.club_logo} alt="Club Logo" className="h-24 w-24 object-contain rounded-xl shadow-lg bg-white/10 p-2" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-4 border-yellow-500/30">
                <Trophy className="h-10 w-10 text-gray-900" />
              </div>
            )}
          </div>
          <p className="text-lg text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            Selamat datang, {user?.name}!
          </p>
        </div>
      </div>

      {/* Running Text Announcements */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl shadow-lg p-4 mb-8 overflow-hidden">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900 whitespace-nowrap">📢 INFO:</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap inline-block">
                {/* Duplicate for smooth loop */}
                {[...announcements, ...announcements].map((ann, idx) => (
                  <span key={`${ann.id}-${idx}`} className="text-gray-900 font-semibold mx-8">
                    {ann.title} - {ann.content} •
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-xl`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{card.value}</h3>
              <p className="text-sm text-gray-600">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Tournament Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tournament Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Informasi Turnamen
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Sistem Poin</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span>Terbaik 1</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">4 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span>Terbaik 2</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">3 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span>Terbaik 3</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">2 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span>Terbaik 4</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">1 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span>Partisipasi</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">1 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>WO / Tidak Hadir</span>
                    <span className="font-bold text-rose-600">0 Poin</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Format Pertandingan</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">Total: 12 Matches</p>
                    <p className="text-sm mt-1 text-green-700">3x seminggu selama 4 minggu</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-yellow-800">Match Days</p>
                    <p className="text-sm mt-1 text-yellow-700">Senin, Jumat, Sabtu</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">Penilaian MPV</p>
                    <p className="text-sm mt-1 text-gray-700">6 match terbaik dari setiap peserta</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">Penilaian Team</p>
                    <p className="text-sm mt-1 text-green-700">2 match terbaik per anggota team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Gallery
            </h2>
            {gallery.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No photos yet</p>
                <p className="text-sm text-gray-500">Admin can add match photos via Settings</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow relative group">
                    {user?.role === 'admin' && (
                      <Button
                        onClick={() => handleDeleteGallery(item.id)}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Image container dengan background putih agar logo tidak terpotong */}
                    <div className="w-full h-48 bg-white flex items-center justify-center p-4">
                      <img 
                        src={item.photo} 
                        alt={item.title} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Announcements */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 border border-yellow-200 sticky top-4">
            <h2
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Announcements
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {announcements.length === 0 ? (
                <div className="bg-white rounded-lg p-4 border border-yellow-300">
                  <p className="text-sm text-gray-600">No announcements yet</p>
                  {user?.role === 'admin' && (
                    <p className="text-xs text-gray-500 mt-2">Admin can add announcements via Settings</p>
                  )}
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="bg-white rounded-lg p-4 border border-yellow-300 shadow-sm relative group">
                    {user?.role === 'admin' && (
                      <Button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                    <h3 className="font-bold text-gray-800 mb-1 pr-6">{ann.title}</h3>
                    <p className="text-sm text-gray-600">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ann.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;