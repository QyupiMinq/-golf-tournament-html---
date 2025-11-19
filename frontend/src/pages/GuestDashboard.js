import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const GuestDashboard = () => {
  const [settings, setSettings] = useState({ organization_logo: null, club_logo: null, vision: null, mission: null });
  const [gallery, setGallery] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchGallery();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/api/public/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API}/api/public/match-gallery`);
      setGallery(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    }
  };

  const handleGalleryClick = (item) => {
    if (item.video_url) {
      setSelectedVideo(item);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 via-green-800 to-gray-800 p-8 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {settings.organization_logo && (
                <img src={settings.organization_logo} alt="Organization Logo" className="h-20 w-20 object-contain rounded-xl shadow-lg bg-white/10 p-2" />
              )}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  MANADO GOLF LEAGUE
                </h1>
                <p className="text-yellow-200 font-semibold tracking-widest text-xs sm:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ONE SPIRIT - ONE FAIRWAY
                </p>
              </div>
              {settings.club_logo && (
                <img src={settings.club_logo} alt="Club Logo" className="h-20 w-20 object-contain rounded-xl shadow-lg bg-white/10 p-2" />
              )}
            </div>
            <Link to="/login">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Visi Misi */}
        {(settings.vision || settings.mission) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Visi & Misi
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {settings.vision && (
                <div>
                  <h3 className="text-xl font-bold text-green-700 mb-3">VISI</h3>
                  <p className="text-gray-700 whitespace-pre-line">{settings.vision}</p>
                </div>
              )}
              {settings.mission && (
                <div>
                  <h3 className="text-xl font-bold text-green-700 mb-3">MISI</h3>
                  <p className="text-gray-700 whitespace-pre-line">{settings.mission}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Gallery
          </h2>
          {gallery.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No photos yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow ${item.video_url ? 'cursor-pointer' : ''}`}
                  onClick={() => handleGalleryClick(item)}
                >
                  <div className="w-full h-48 bg-white flex items-center justify-center p-4 relative">
                    <img 
                      src={item.photo} 
                      alt={item.title} 
                      className="max-w-full max-h-full object-contain" 
                    />
                    {item.video_url && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.video_url && (
                      <p className="text-xs text-blue-600 mt-2">▶ Click to play video</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <iframe
                  width="100%"
                  height="100%"
                  src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-gray-600 mt-4">{selectedVideo.description}</p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 text-center">
          <Link to="/guest/players">
            <Button className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 mx-2">
              View Players
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
