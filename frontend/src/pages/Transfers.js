import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Transfers = () => {
  const { user } = useContext(AuthContext);
  const [transfers, setTransfers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    player_id: '',
    from_team_id: '',
    to_team_id: '',
    notes: '',
  });

  useEffect(() => {
    fetchTransfers();
    fetchPlayers();
    fetchTeams();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await axios.get(`${API}/transfers`);
      setTransfers(response.data);
    } catch (error) {
      toast.error('Gagal memuat transfers');
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

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handlePlayerChange = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (player) {
      setFormData({
        ...formData,
        player_id: playerId,
        from_team_id: player.team_id,
        to_team_id: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transfers`, formData);
      toast.success('Transfer berhasil!');
      fetchTransfers();
      fetchPlayers();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal melakukan transfer');
    }
  };

  const resetForm = () => {
    setFormData({ player_id: '', from_team_id: '', to_team_id: '', notes: '' });
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="transfers-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-emerald-800 mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Transfers
          </h1>
          <p className="text-emerald-600">History transfer pemain antar team</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-transfer-btn"
                onClick={resetForm}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Transfer Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Player</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Pilih Player</Label>
                  <Select value={formData.player_id} onValueChange={handlePlayerChange}>
                    <SelectTrigger data-testid="transfer-player-select">
                      <SelectValue placeholder="Pilih player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => {
                        const team = teams.find((t) => t.id === player.team_id);
                        return (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name} ({team?.name || 'No Team'})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                {formData.from_team_id && (
                  <div>
                    <Label>Dari Team</Label>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <p className="font-semibold">{teams.find((t) => t.id === formData.from_team_id)?.name}</p>
                    </div>
                  </div>
                )}
                <div>
                  <Label>Ke Team</Label>
                  <Select
                    value={formData.to_team_id}
                    onValueChange={(value) => setFormData({ ...formData, to_team_id: value })}
                  >
                    <SelectTrigger data-testid="transfer-to-team-select">
                      <SelectValue placeholder="Pilih team tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter((t) => t.id !== formData.from_team_id)
                        .map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Catatan (Opsional)</Label>
                  <Textarea
                    data-testid="transfer-notes-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Masukkan catatan transfer..."
                  />
                </div>
                <Button data-testid="transfer-submit-btn" type="submit" className="w-full">
                  Transfer Player
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Transfers Timeline */}
      <div className="space-y-4">
        {transfers.map((transfer) => {
          const player = players.find((p) => p.id === transfer.player_id);
          const fromTeam = teams.find((t) => t.id === transfer.from_team_id);
          const toTeam = teams.find((t) => t.id === transfer.to_team_id);
          const date = new Date(transfer.transfer_date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          return (
            <div
              key={transfer.id}
              data-testid={`transfer-card-${transfer.id}`}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1">
                  {/* Player Info */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-emerald-600">{player?.name.charAt(0)}</span>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-800">{player?.name || 'Unknown Player'}</p>
                      <p className="text-sm text-gray-600">{date}</p>
                    </div>

                    {/* From Team */}
                    <div className="text-center px-4 py-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Dari</p>
                      <p className="font-semibold text-gray-800">{fromTeam?.name || 'Unknown'}</p>
                    </div>

                    <ArrowRight className="h-6 w-6 text-gray-400" />

                    {/* To Team */}
                    <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Ke</p>
                      <p className="font-semibold text-gray-800">{toTeam?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {transfer.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Catatan:</span> {transfer.notes}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {transfers.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl">
          <p>Belum ada history transfer</p>
        </div>
      )}
    </div>
  );
};

export default Transfers;