import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Players = () => {
  const { user } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    team_id: '',
    handicap: 0,
    payment_status: false,
    photo: '',
  });

  useEffect(() => {
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${API}/players`);
      setPlayers(response.data);
    } catch (error) {
      toast.error('Gagal memuat players');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await axios.put(`${API}/players/${editingPlayer.id}`, formData);
        toast.success('Player berhasil diupdate');
      } else {
        await axios.post(`${API}/players`, formData);
        toast.success('Player berhasil ditambahkan');
      }
      fetchPlayers();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan player');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus player ini?')) return;
    try {
      await axios.delete(`${API}/players/${id}`);
      toast.success('Player berhasil dihapus');
      fetchPlayers();
    } catch (error) {
      toast.error('Gagal menghapus player');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', team_id: '', handicap: 0, payment_status: false, photo: '' });
    setEditingPlayer(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditDialog = (player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      email: player.email || '',
      team_id: player.team_id,
      handicap: player.handicap,
      payment_status: player.payment_status,
      photo: player.photo || '',
    });
    setOpen(true);
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="players-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Players
          </h1>
          <p className="text-gray-600">Manajemen pemain golf league</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-player-btn"
                onClick={resetForm}
                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Player
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900">
                  {editingPlayer ? 'Edit Player' : 'Tambah Player Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold">Nama Lengkap</Label>
                  <Input
                    data-testid="player-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Email (Opsional)</Label>
                  <Input
                    data-testid="player-email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Foto Player</Label>
                  <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors">
                    <Input
                      data-testid="player-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="border-0 p-0"
                    />
                  </div>
                  {formData.photo && (
                    <div className="mt-3 flex justify-center">
                      <img src={formData.photo} alt="Photo preview" className="h-24 w-24 object-cover rounded-full border-4 border-yellow-400 shadow-lg" />
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Team</Label>
                  <Select
                    value={formData.team_id}
                    onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                  >
                    <SelectTrigger data-testid="player-team-select" className="border-gray-300">
                      <SelectValue placeholder="Pilih team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Handicap</Label>
                  <Input
                    data-testid="player-handicap-input"
                    type="number"
                    value={formData.handicap}
                    onChange={(e) => setFormData({ ...formData, handicap: parseInt(e.target.value) || 0 })}
                    className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <input
                    data-testid="player-payment-checkbox"
                    type="checkbox"
                    id="payment"
                    checked={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.checked })}
                    className="rounded border-gray-300 text-green-700 focus:ring-green-600"
                  />
                  <Label htmlFor="payment" className="text-gray-700 font-medium">Pembayaran Lunas (Rp 100.000)</Label>
                </div>
                <Button data-testid="player-submit-btn" type="submit" className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 font-semibold shadow-lg">
                  {editingPlayer ? 'Update Player' : 'Tambah Player'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-700 to-green-800">
              <tr>
                <th className="px-6 py-4 text-center text-yellow-300 font-semibold">Foto</th>
                <th className="px-6 py-4 text-left text-yellow-300 font-semibold pl-20">Player</th>
                <th className="px-6 py-4 text-center text-yellow-300 font-semibold">Email</th>
                <th className="px-6 py-4 text-center text-yellow-300 font-semibold">Team</th>
                <th className="px-6 py-4 text-center text-yellow-300 font-semibold">Handicap</th>
                <th className="px-6 py-4 text-center text-yellow-300 font-semibold">Pembayaran</th>
                {isAdmin && <th className="px-6 py-4 text-center text-yellow-300 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const team = teams.find((t) => t.id === player.team_id);
                return (
                  <tr key={player.id} data-testid={`player-row-${player.id}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {player.photo ? (
                          <img src={player.photo} alt={player.name} className="h-12 w-12 rounded-full object-cover border-2 border-yellow-400 shadow-md" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center border-2 border-gray-300">
                            <span className="text-lg font-bold text-green-700">{player.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left font-semibold text-gray-800 pl-20">{player.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{player.email || '-'}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{team?.name || 'No Team'}</td>
                    <td className="px-6 py-4 text-center text-gray-800 font-semibold">{player.handicap}</td>
                    <td className="px-6 py-4 text-center">
                      {player.payment_status ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <Check className="h-3 w-3" /> Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold">
                          <X className="h-3 w-3" /> Belum
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            data-testid={`edit-player-${player.id}`}
                            onClick={() => openEditDialog(player)}
                            variant="ghost"
                            size="sm"
                            className="text-green-700 hover:text-green-800 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`delete-player-${player.id}`}
                            onClick={() => handleDelete(player.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {players.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Belum ada player. Tambahkan player pertama!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;