import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '@/App';
import { Trophy, Users, UserCheck, CalendarDays, Award, Repeat, LogOut, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({ dashboard_logo: null, footer_signature: null });

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/', icon: Trophy },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Players', path: '/players', icon: UserCheck },
    { name: 'Matches', path: '/matches', icon: CalendarDays },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'Transfers', path: '/transfers', icon: Repeat },
  ];

  // Add Settings for admin
  const adminNavigation = user?.role === 'admin' 
    ? [...navigation, { name: 'Settings', path: '/settings', icon: Settings }]
    : navigation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          data-testid="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out`}
      >
        <div className="h-full flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 bg-gradient-to-br from-gray-800 via-green-800 to-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl ring-4 ring-yellow-500/30">
                  <Trophy className="h-9 w-9 text-gray-900" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  MANADO GOLF LEAGUE
                </h1>
                <p className="text-yellow-200 text-xs font-semibold tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
                  ONE SPIRIT - ONE FAIRWAY
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-green-700 to-green-800 text-yellow-300 font-semibold shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-green-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={logout}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen p-4 sm:p-6 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto">{children}</div>
        
        {/* Footer */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-gradient-to-r from-gray-800 via-green-800 to-gray-800 py-4 px-6 shadow-lg z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <p className="text-yellow-200 font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Created By Onedhee 2025
            </p>
            {settings.footer_signature ? (
              <img src={settings.footer_signature} alt="Signature" className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                <Trophy className="h-4 w-4 text-gray-900" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;