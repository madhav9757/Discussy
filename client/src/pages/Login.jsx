import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../features/auth/authSlice';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../app/constant';
import { toast } from 'sonner';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        dispatch(setCredentials({ user: data.user || data, token: data.token }));
        toast.success('AUTH_SUCCESS', { className: "font-mono text-xs rounded-none border-border" });
        navigate('/');
      } else {
        toast.error(`ERR: ${data.message || 'AUTH_FAIL'}`, { className: "font-mono text-xs border-red-500 rounded-none bg-red-500/10 text-red-500" });
      }
    } catch (err) {
      toast.error('ERR: NETWORK_TIMEOUT', { className: "font-mono text-xs rounded-none" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-border/60 bg-card rounded-3xl shadow-sm overflow-hidden p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">Email or Username</label>
            <Input
              type="text"
              required
              placeholder="Enter your email or username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="h-11 rounded-full border-border/60 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary px-4 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground/90">Password</label>
            </div>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-full border-border/60 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary px-4 transition-all"
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-11 rounded-full font-medium text-[15px] shadow-sm transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
            </Button>
            <div className="mt-6 text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
