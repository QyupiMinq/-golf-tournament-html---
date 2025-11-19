import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const API = process.env.REACT_APP_BACKEND_URL;

const GuestPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        axios.get(`${API}/api/public/players`),
        axios.get(`${API}/api/public/teams`)
      ]);
      setPlayers(playersRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-700">Players</h1>
          <Link to="/guest"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-700 to-green-800">
                <tr>
                  <th className="px-6 py-4 text-center text-yellow-300">Photo</th>
                  <th className="px-6 py-4 text-left text-yellow-300">Name</th>
                  <th className="px-6 py-4 text-center text-yellow-300">Team</th>
                  <th className="px-6 py-4 text-center text-yellow-300">Handicap</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const team = teams.find((t) => t.id === player.team_id);
                  return (
                    <tr key={player.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-center">
                        {player.photo ? (
                          <img src={player.photo} alt={player.name} className="w-16 h-16 rounded-full object-cover mx-auto" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-500 font-bold">{player.name?.[0]}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{player.name}</td>
                      <td className="px-6 py-4 text-center">{team?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-center font-semibold text-green-700">{player.handicap || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPlayers;
