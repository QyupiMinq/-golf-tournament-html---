import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Users, UserCheck, CalendarDays, Trophy, TrendingUp, Trash2, X, Play, Moon, Sun } from 'lucide-react';
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
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    fetchStats();
    fetchSettings();
    fetchAnnouncements();
    fetchGallery();
    
    // Auto-refresh settings every 3 seconds to catch logo updates
    const settingsInterval = setInterval(fetchSettings, 3000);
    
    return () => {
      clearInterval(settingsInterval);
    };
  }, []);

  useEffect(() => {
    console.log('Dark Mode Changed:', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      console.log('Dark class added to HTML');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Dark class removed from HTML');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    console.log('Toggle Dark Mode clicked. Current:', darkMode, '=> New:', !darkMode);
    setDarkMode(prev => !prev);
  };

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
      // Add cache busting to force fresh data
      const response = await axios.get(`${API}/settings`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
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

  const handleGalleryClick = (item) => {
    console.log('Gallery clicked:', item);
    console.log('Has video?', hasVideo(item));
    if (hasVideo(item)) {
      console.log('Opening video modal...');
      setSelectedVideo(item);
    } else {
      toast.info('No video available for this item');
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const hasVideo = (item) => {
    return item.video_url || item.video_file;
  };

  const statCards = stats
    ? [
        { icon: Users, label: 'Total Teams', value: stats.teams_count, color: 'bg-gradient-to-br from-emerald-700 to-emerald-900', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
        { icon: UserCheck, label: 'Total Players', value: stats.players_count, color: 'bg-gradient-to-br from-amber-600 to-amber-800', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
        { icon: CalendarDays, label: 'Total Matches', value: stats.matches_count, color: 'bg-gradient-to-br from-slate-700 to-slate-900', glow: 'shadow-[0_0_20px_rgba(71,85,105,0.3)]' },
        { icon: Trophy, label: 'Completed', value: stats.completed_matches, color: 'bg-gradient-to-br from-emerald-800 to-slate-900', glow: 'shadow-[0_0_20px_rgba(5,150,105,0.3)]' },
        { icon: TrendingUp, label: 'Pending', value: stats.pending_matches, color: 'bg-gradient-to-br from-amber-700 to-amber-900', glow: 'shadow-[0_0_20px_rgba(217,119,6,0.3)]' },
      ]
    : [];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="dashboard-page" className="dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Header - Premium Dark Theme with Gold Accents - STICKY */}
      <div className="sticky top-0 z-40 mb-4 sm:mb-8 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-950 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl relative overflow-hidden border border-amber-500/20 dark:border-amber-600/30 mt-0 lg:mt-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-emerald-500/5"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,191,36,0.05)_50%,transparent_75%,transparent_100%)]"></div>
        
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-amber-500/20 hover:bg-amber-500/30 p-2 sm:p-3 rounded-full transition-all duration-300 border border-amber-500/30 hover:border-amber-500/50 backdrop-blur-sm"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
          ) : (
            <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
          )}
        </button>
        
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4">
            {/* Logo Organisasi (Kiri) - Hidden on mobile */}
            {settings.organization_logo ? (
              <div className="hidden sm:block">
                <img 
                  src={`${settings.organization_logo}?t=${Date.now()}`}
                  alt="Organization Logo" 
                  className="h-24 sm:h-32 w-24 sm:w-32 object-cover rounded-full shadow-2xl border-4 border-amber-400/40 ring-4 ring-amber-500/20" 
                />
              </div>
            ) : (
              <div className="hidden sm:flex w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-green-500 to-green-700 items-center justify-center shadow-lg border-4 border-green-500/30">
                <Trophy className="h-10 sm:h-12 w-10 sm:w-12 text-white" />
              </div>
            )}
            
            <div>
              <h1
                className="text-2xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 mb-1 sm:mb-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.02em' }}
              >
                MANADO GOLF LEAGUE
              </h1>
              <p className="text-amber-200/90 font-semibold tracking-[0.15em] sm:tracking-[0.3em] text-xs sm:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                ONE SPIRIT - ONE FAIRWAY
              </p>
            </div>
            
            {/* Logo Club (Kanan) - Hidden on mobile */}
            {settings.club_logo ? (
              <div className="hidden sm:block">
                <img 
                  src={`${settings.club_logo}?t=${Date.now()}`}
                  alt="Club Logo" 
                  className="h-24 sm:h-32 w-24 sm:w-32 object-cover rounded-full shadow-2xl border-4 border-amber-400/40 ring-4 ring-amber-500/20" 
                />
              </div>
            ) : (
              <div className="hidden sm:flex w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 items-center justify-center shadow-lg border-4 border-yellow-500/30">
                <Trophy className="h-10 sm:h-12 w-10 sm:w-12 text-gray-900" />
              </div>
            )}
          </div>
          <p className="text-sm sm:text-lg text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            Selamat datang, {user?.name}!
          </p>
        </div>
      </div>

      {/* Running Text Announcements */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-8 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap text-sm sm:text-base">📢 INFO:</span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap inline-block">
                {/* Duplicate for smooth loop */}
                {[...announcements, ...announcements].map((ann, idx) => (
                  <span key={`${ann.id}-${idx}`} className="text-gray-900 dark:text-gray-100 font-semibold mx-4 sm:mx-8 text-sm sm:text-base">
                    {ann.title} - {ann.content} •
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visi Misi Section */}
      {(settings.vision || settings.mission) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-4 sm:mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-600 mb-4 sm:mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Visi & Misi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            {settings.vision && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400 mb-2 sm:mb-3">VISI</h3>
                <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 prose prose-sm sm:prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: settings.vision }}></div>
              </div>
            )}
            {settings.mission && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400 mb-2 sm:mb-3">MISI</h3>
                <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 prose prose-sm sm:prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: settings.mission }}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              data-testid={`stat-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:scale-105"
            >
              <div className="flex items-center justify-center sm:justify-between mb-2 sm:mb-4">
                <div className={`${card.color} ${card.glow} p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300`}>
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-amber-100" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-4xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-1 text-center sm:text-left">{card.value}</h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide text-center sm:text-left">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Tournament Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tournament Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2
              className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-600 mb-6"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Informasi Turnamen
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Sistem Poin</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span>Terbaik 1</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">4 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span>Terbaik 2</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">3 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span>Terbaik 3</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">2 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span>Terbaik 4</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">1 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span>Partisipasi</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-700">1 Poin</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>WO / Tidak Hadir</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">0 Poin</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Format Pertandingan</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="font-semibold text-green-800 dark:text-green-300">Total: 12 Matches</p>
                    <p className="text-sm mt-1 text-green-700 dark:text-green-400">3x seminggu selama 4 minggu</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300">Match Days</p>
                    <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-400">Senin, Jumat, Sabtu</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Penilaian MPV</p>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">6 match terbaik dari setiap peserta</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-900/30 dark:to-yellow-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="font-semibold text-green-800 dark:text-green-300">Penilaian Team</p>
                    <p className="text-sm mt-1 text-green-700 dark:text-green-400">2 match terbaik per anggota team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-600 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              📷 Photo Gallery
            </h2>
            {gallery.filter(item => !hasVideo(item)).length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No photos yet</p>
                <p className="text-sm text-gray-500">Admin can add photos via Settings</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gallery.filter(item => !hasVideo(item)).map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative group"
                  >
                    {user?.role === 'admin' && (
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGallery(item.id); }}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 group-hover:opacity-100 opacity-70 hover:opacity-100 transition-opacity z-20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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

          {/* Video Gallery Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              🎬 Video Gallery
            </h2>
            {gallery.filter(item => hasVideo(item)).length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No videos yet</p>
                <p className="text-sm text-gray-500">Admin can add videos via Settings</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.filter(item => hasVideo(item)).map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative group cursor-pointer hover:scale-[1.02]"
                    onClick={() => handleGalleryClick(item)}
                  >
                    {user?.role === 'admin' && (
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGallery(item.id); }}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 group-hover:opacity-100 opacity-70 hover:opacity-100 transition-opacity z-20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="w-full h-48 bg-white flex items-center justify-center p-4 relative">
                      <img 
                        src={item.photo} 
                        alt={item.title} 
                        className="max-w-full max-h-full object-contain" 
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                          <Play className="h-8 w-8 text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-xs text-blue-600 mt-2">▶ Click to play video</p>
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedVideo.title}</h3>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo.video_file ? (
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={selectedVideo.video_file}
                >
                  Your browser does not support the video tag.
                </video>
              ) : selectedVideo.video_url ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  No video available
                </div>
              )}
            </div>
            <p className="text-gray-600 mt-4">{selectedVideo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;