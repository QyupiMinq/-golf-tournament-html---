import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '@/App';
import { UserCheck, UserX, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [pending, all] = await Promise.all([
        axios.get(`${API}/users/pending`),
        axios.get(`${API}/users`)
      ]);
      setPendingUsers(pending.data);
      setAllUsers(all.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post(`${API}/users/${userId}/approve`);
      toast.success('User approved successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    
    try {
      await axios.post(`${API}/users/${userId}/reject`);
      toast.success('User rejected');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Only admin can access user management</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div data-testid="user-management-page">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-900 mb-2"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            User Management
          </h1>
          <p className="text-gray-600">Manage player registrations and approvals</p>
        </div>
        <Button
          onClick={fetchUsers}
          disabled={loading}
          variant="outline"
          className="border-green-700 text-green-700 hover:bg-green-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'pending'
                ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending Approvals ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Users ({allUsers.length})
          </button>
        </div>
      </div>

      {/* Pending Users Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
              <UserCheck className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No pending registrations</p>
              <p className="text-sm text-gray-500 mt-2">All users have been reviewed</p>
            </div>
          ) : (
            pendingUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{u.name}</h3>
                      {getStatusBadge(u.approval_status)}
                    </div>
                    <p className="text-gray-600 mb-1">📧 {u.email}</p>
                    <p className="text-sm text-gray-500">
                      Registered: {new Date(u.created_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(u.id)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(u.id)}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(u.approval_status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
