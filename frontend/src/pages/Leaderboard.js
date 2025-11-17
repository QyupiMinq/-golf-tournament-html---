import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Trophy, Medal, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Leaderboard = () => {
  const [individualLeaderboard, setIndividualLeaderboard] = useState([]);
  const [teamLeaderboard, setTeamLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const [individual, team] = await Promise.all([
        axios.get(`${API}/leaderboard/individual`),
        axios.get(`${API}/leaderboard/team`),
      ]);
      setIndividualLeaderboard(individual.data);
      setTeamLeaderboard(team.data);
    } catch (error) {
      toast.error('Gagal memuat leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="leaderboard-page">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl sm:text-5xl font-bold text-emerald-800 mb-2"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          Leaderboard
        </h1>
        <p className="text-emerald-600">Peringkat pemain dan tim</p>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="individual" data-testid="tab-individual">Individual</TabsTrigger>
          <TabsTrigger value="team" data-testid="tab-team">Team</TabsTrigger>
        </TabsList>

        {/* Individual Leaderboard */}
        <TabsContent value="individual">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
              <h2 className="text-2xl font-bold text-white">Peringkat Individual</h2>
              <p className="text-emerald-100">Berdasarkan 6 match terbaik</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Player</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Team</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Matches</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {individualLeaderboard.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={entry.player_id}
                        data-testid={`individual-rank-${rank}`}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-emerald-50 transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                getRankBadge(rank)
                              }`}
                            >
                              {rank <= 3 ? getRankIcon(rank) : rank}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{entry.player_name}</td>
                        <td className="px-6 py-4 text-gray-600">{entry.team_name}</td>
                        <td className="px-6 py-4 text-center text-gray-800">{entry.matches_played}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-full">
                            {entry.total_points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {individualLeaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Belum ada data leaderboard</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Team Leaderboard */}
        <TabsContent value="team">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teamLeaderboard.map((entry, index) => {
              const rank = index + 1;
              return (
                <div
                  key={entry.team_id}
                  data-testid={`team-rank-${rank}`}
                  className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${
                    rank === 1 ? 'ring-4 ring-yellow-400' : rank === 2 ? 'ring-4 ring-gray-300' : rank === 3 ? 'ring-4 ring-amber-400' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankBadge(rank)}`}>
                      {rank <= 3 ? getRankIcon(rank) : `#${rank}`}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-emerald-700">{entry.total_points}</p>
                      <p className="text-xs text-gray-600">Total Points</p>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {entry.team_logo ? (
                      <img src={entry.team_logo} alt={entry.team_name} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-emerald-600">{entry.team_name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{entry.team_name}</h3>
                      <p className="text-sm text-gray-600">{entry.player_count} Players</p>
                    </div>
                  </div>

                  {/* Players */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Kontribusi Pemain:</p>
                    {entry.players.map((player, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                        <span className="text-gray-700">{player.player_name}</span>
                        <span className="font-semibold text-emerald-600">{player.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {teamLeaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-2xl">
              <p>Belum ada data leaderboard team</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;