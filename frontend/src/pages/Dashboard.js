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
        { icon: Users, label: 'Total Teams', value: stats.teams_count, color: 'bg-blue-500' },
        { icon: UserCheck, label: 'Total Players', value: stats.players_count, color: 'bg-emerald-500' },
        { icon: CalendarDays, label: 'Total Matches', value: stats.matches_count, color: 'bg-purple-500' },
        { icon: Trophy, label: 'Completed', value: stats.completed_matches, color: 'bg-amber-500' },
        { icon: TrendingUp, label: 'Pending', value: stats.pending_matches, color: 'bg-rose-500' },
      ]
    : [];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl sm:text-5xl font-bold text-emerald-800 mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Dashboard
        </h1>
        <p className="text-lg text-emerald-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          Selamat datang, {user?.name}!
        </p>
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
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2
          className="text-3xl font-bold text-emerald-800 mb-6"
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
                <span className="font-bold text-emerald-600">4 Poin</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Terbaik 2</span>
                <span className="font-bold text-emerald-600">3 Poin</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Terbaik 3</span>
                <span className="font-bold text-emerald-600">2 Poin</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Terbaik 4</span>
                <span className="font-bold text-emerald-600">1 Poin</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Partisipasi</span>
                <span className="font-bold text-emerald-600">1 Poin</span>
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
              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="font-semibold">Total: 12 Matches</p>
                <p className="text-sm mt-1">3x seminggu selama 4 minggu</p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="font-semibold">Match Days</p>
                <p className="text-sm mt-1">Senin, Jumat, Sabtu</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold">Penilaian MPV</p>
                <p className="text-sm mt-1">6 match terbaik dari setiap peserta</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="font-semibold">Penilaian Team</p>
                <p className="text-sm mt-1">2 match terbaik per anggota team</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;