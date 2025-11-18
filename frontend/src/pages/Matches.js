import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Plus, Edit, Trash2, CheckCircle, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Matches = () => {
  const { user } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    match_number: 1,
    date: '',
    match_type: 'individual',
  });
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API}/matches`);
      setMatches(response.data);
    } catch (error) {
      toast.error('Gagal memuat matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${API}/players`);
      setPlayers(response.data);
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMatch) {
        await axios.put(`${API}/matches/${editingMatch.id}`, formData);
        toast.success('Match berhasil diupdate');
      } else {
        await axios.post(`${API}/matches`, formData);
        toast.success('Match berhasil ditambahkan');
      }
      fetchMatches();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan match');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus match ini?')) return;
    try {
      await axios.delete(`${API}/matches/${id}`);
      toast.success('Match berhasil dihapus');
      fetchMatches();
    } catch (error) {
      toast.error('Gagal menghapus match');
    }
  };

  const resetForm = () => {
    setFormData({ match_number: 1, date: '', match_type: 'individual' });
    setEditingMatch(null);
  };

  const openEditDialog = (match) => {
    setEditingMatch(match);
    setFormData({
      match_number: match.match_number,
      date: match.date,
      match_type: match.match_type,
    });
    setOpen(true);
  };

  const openResultDialog = (match) => {
    setSelectedMatch(match);
    const initialResults = players.map((player) => ({
      player_id: player.id,
      player_name: player.name,
      points: 1,
      position: null,
      attended: true,
    }));
    setResults(initialResults);
    setResultDialogOpen(true);
  };

  const handleResultChange = (playerId, field, value) => {
    setResults((prev) =>
      prev.map((r) => (r.player_id === playerId ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmitResults = async () => {
    try {
      const resultsData = results
        .filter((r) => r.attended)
        .map((r) => ({
          match_id: selectedMatch.id,
          player_id: r.player_id,
          points: r.points,
          position: r.position,
          attended: r.attended,
        }));

      await axios.post(`${API}/match-results/bulk`, resultsData);
      await axios.put(`${API}/matches/${selectedMatch.id}`, { status: 'completed' });
      toast.success('Hasil match berhasil disimpan');
      fetchMatches();
      setResultDialogOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan hasil match');
    }
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="matches-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Matches
          </h1>
          <p className="text-gray-600">Jadwal dan hasil pertandingan</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => { setLoading(true); fetchMatches(); fetchPlayers(); }}
            disabled={loading}
            variant="outline"
            className="border-green-700 text-green-700 hover:bg-green-50"
            data-testid="refresh-matches-btn"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  data-testid="add-match-btn"
                  onClick={resetForm}
                  className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Match
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900">  {editingMatch ? 'Edit Match' : 'Tambah Match Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Nomor Match</Label>
                  <Input
                    data-testid="match-number-input"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.match_number}
                    onChange={(e) => setFormData({ ...formData, match_number: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Tanggal</Label>
                  <Input
                    data-testid="match-date-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Tipe Match</Label>
                  <Select
                    value={formData.match_type}
                    onValueChange={(value) => setFormData({ ...formData, match_type: value })}
                  >
                    <SelectTrigger data-testid="match-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="team">Team (Foursome/Scramble)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button data-testid="match-submit-btn" type="submit" className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 font-semibold shadow-lg">
                  {editingMatch ? 'Update Match' : 'Tambah Match'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            data-testid={`match-card-${match.id}`}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                  <Trophy className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Match #{match.match_number}</h3>
                  <p className="text-sm text-gray-600">{match.date}</p>
                </div>
              </div>
              {match.status === 'completed' && (
                <CheckCircle className="h-6 w-6 text-green-600" data-testid={`match-completed-${match.id}`} />
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tipe:</span>
                <span className="font-semibold capitalize">{match.match_type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    match.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {match.status === 'completed' ? 'Selesai' : 'Scheduled'}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                {match.status !== 'completed' && (
                  <Button
                    data-testid={`input-result-${match.id}`}
                    onClick={() => openResultDialog(match)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    size="sm"
                  >
                    Input Hasil
                  </Button>
                )}
                <Button
                  data-testid={`edit-match-${match.id}`}
                  onClick={() => openEditDialog(match)}
                  variant="outline"
                  size="sm"
                  className="border-green-700 text-green-700 hover:bg-green-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  data-testid={`delete-match-${match.id}`}
                  onClick={() => handleDelete(match.id)}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Belum ada match. Tambahkan match pertama!</p>
        </div>
      )}

      {/* Result Input Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900">Input Hasil Match #{selectedMatch?.match_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.player_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  checked={result.attended}
                  onChange={(e) => handleResultChange(result.player_id, 'attended', e.target.checked)}
                  className="rounded text-green-700 focus:ring-green-600"
                />
                <div className="flex-1">
                  <p className="font-semibold">{result.player_name}</p>
                </div>
                {result.attended && (
                  <>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Poin"
                        value={result.points}
                        onChange={(e) =>
                          handleResultChange(result.player_id, 'points', parseInt(e.target.value) || 0)
                        }
                        min="0"
                        max="4"
                      />
                    </div>
                    <div className="w-32">
                      <Select
                        value={result.position?.toString() || ''}
                        onValueChange={(value) =>
                          handleResultChange(result.player_id, 'position', value ? parseInt(value) : null)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Posisi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st</SelectItem>
                          <SelectItem value="2">2nd</SelectItem>
                          <SelectItem value="3">3rd</SelectItem>
                          <SelectItem value="4">4th</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            ))}
            <Button onClick={handleSubmitResults} className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 font-semibold shadow-lg" data-testid="submit-results-btn">
              Simpan Hasil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Matches;