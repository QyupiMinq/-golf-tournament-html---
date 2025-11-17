import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Users, UserCheck, CalendarDays, Trophy, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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
            {/* Club Logo */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-4 border-yellow-500/30">
              <Trophy className="h-10 w-10 text-gray-900" />
            </div>
            
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
            
            {/* Club Logo (right side for symmetry) */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg border-4 border-yellow-500/30">
              <Trophy className="h-10 w-10 text-gray-900" />
            </div>
          </div>
          <p className="text-lg text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
            Selamat datang, {user?.name}!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
    </div>
  );
};

export default Dashboard;