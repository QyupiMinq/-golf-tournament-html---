import React, { useState, useContext } from 'react';
import { AuthContext } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Login = () => {
  const { login, register } = useContext(AuthContext);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ email: '', password: '', name: '', role: 'player' });
  const [settings, setSettings] = useState({ login_logo: null });

  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/settings?t=${Date.now()}`);
      console.log('Fetched settings:', response.data);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register(registerData.email, registerData.password, registerData.name, registerData.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 via-green-900 to-gray-900 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 via-transparent to-yellow-600/5"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(250, 204, 21, 0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          {settings.login_logo ? (
            <div className="inline-block mb-6">
              <img 
                src={settings.login_logo} 
                alt="Club Logo" 
                className="h-32 w-32 object-contain mx-auto rounded-xl shadow-2xl bg-white/10 p-3" 
              />
            </div>
          ) : (
            <div className="inline-block p-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-2xl mb-6 ring-8 ring-yellow-500/20">
              <Trophy className="h-20 w-20 text-gray-900" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            MANADO GOLF LEAGUE
          </h1>
          <p className="text-yellow-200 font-semibold tracking-widest text-xs sm:text-sm mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            ONE SPIRIT - ONE FAIRWAY
          </p>
          <p className="text-gray-400 text-xs sm:text-sm">
            Sistem Manajemen Turnamen Golf
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
              <TabsTrigger value="login" data-testid="tab-login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-700 data-[state=active]:to-green-800 data-[state=active]:text-yellow-300">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-700 data-[state=active]:to-green-800 data-[state=active]:text-yellow-300">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    data-testid="login-email-input"
                    type="email"
                    placeholder="email@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    data-testid="login-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button
                  data-testid="login-submit-btn"
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 font-semibold shadow-lg"
                >
                  Login
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Nama Lengkap</Label>
                  <Input
                    id="register-name"
                    data-testid="register-name-input"
                    type="text"
                    placeholder="Nama Anda"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    data-testid="register-email-input"
                    type="email"
                    placeholder="email@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    data-testid="register-password-input"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-role">Role</Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData({ ...registerData, role: value })}
                  >
                    <SelectTrigger data-testid="register-role-select">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  data-testid="register-submit-btn"
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-yellow-300 font-semibold shadow-lg"
                >
                  Register
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;