import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Plus, Edit, Trash2, Upload, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Teams = () => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    captain_id: '',
    logo: '',
    payment_status: false,
  });

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/teams`);
      setTeams(response.data);
    } catch (error) {
      toast.error('Gagal memuat teams');
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
      if (editingTeam) {
        await axios.put(`${API}/teams/${editingTeam.id}`, formData);
        toast.success('Team berhasil diupdate');
      } else {
        await axios.post(`${API}/teams`, formData);
        toast.success('Team berhasil ditambahkan');
      }
      fetchTeams();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan team');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus team ini?')) return;
    try {
      await axios.delete(`${API}/teams/${id}`);
      toast.success('Team berhasil dihapus');
      fetchTeams();
    } catch (error) {
      toast.error('Gagal menghapus team');
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', captain_id: '', logo: '', payment_status: false });
    setEditingTeam(null);
  };

  const openEditDialog = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      captain_id: team.captain_id,
      logo: team.logo || '',
      payment_status: team.payment_status,
    });
    setOpen(true);
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="teams-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Teams
          </h1>
          <p className="text-gray-600">Manajemen tim golf league</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-team-btn"
                onClick={resetForm}
                className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTeam ? 'Edit Team' : 'Tambah Team Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nama Team</Label>
                  <Input
                    data-testid="team-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Captain</Label>
                  <Select
                    value={formData.captain_id}
                    onValueChange={(value) => setFormData({ ...formData, captain_id: value })}
                  >
                    <SelectTrigger data-testid="team-captain-select">
                      <SelectValue placeholder="Pilih captain" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Logo Team</Label>
                  <Input
                    data-testid="team-logo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  {formData.logo && (
                    <img src={formData.logo} alt="Logo preview" className="mt-2 h-20 w-20 object-cover rounded" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    data-testid="team-payment-checkbox"
                    type="checkbox"
                    id="payment"
                    checked={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="payment">Pembayaran Lunas (Rp 500.000)</Label>
                </div>
                <Button data-testid="team-submit-btn" type="submit" className="w-full">
                  {editingTeam ? 'Update' : 'Tambah'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const teamPlayers = players.filter((p) => p.team_id === team.id);
          const captain = players.find((p) => p.id === team.captain_id);

          return (
            <div
              key={team.id}
              data-testid={`team-card-${team.id}`}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              {/* Team Logo & Name */}
              <div className="flex items-center space-x-4 mb-4">
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">{team.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{team.name}</h3>
                  <p className="text-sm text-gray-600">Captain: {captain?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Team Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Jumlah Pemain:</span>
                  <span className="font-semibold">{teamPlayers.length}/6</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Status Bayar:</span>
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      team.payment_status ? 'text-green-600' : 'text-rose-600'
                    }`}
                  >
                    {team.payment_status ? (
                      <>
                        <Check className="h-4 w-4" /> Lunas
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" /> Belum
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    data-testid={`edit-team-${team.id}`}
                    onClick={() => openEditDialog(team)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    data-testid={`delete-team-${team.id}`}
                    onClick={() => handleDelete(team.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Belum ada team. Tambahkan team pertama!</p>
        </div>
      )}
    </div>
  );
};

export default Teams;