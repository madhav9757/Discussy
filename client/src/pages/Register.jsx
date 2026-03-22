import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../app/constant';
import { toast } from 'sonner';

import { useRegisterMutation } from '../app/api/userApi';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      toast.success('USER_CREATED_SUCCESS', { className: "font-mono text-xs rounded-none" });
      navigate('/login');
    } catch (err) {
      toast.error(`ERR: ${err.data?.message || 'REGISTRATION_FAIL'}`, { className: "font-mono text-xs border-red-500 rounded-none bg-red-500/10 text-red-500" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-border/60 bg-card rounded-3xl shadow-sm overflow-hidden p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join the community today</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">Username</label>
            <Input
              type="text"
              name="username"
              required
              placeholder="e.g. user123"
              value={formData.username}
              onChange={handleChange}
              className="h-11 rounded-full border-border/60 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary px-4 transition-all lowercase"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">Email Address</label>
            <Input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="h-11 rounded-full border-border/60 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary px-4 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/90">Password</label>
            <Input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="h-11 rounded-full border-border/60 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary px-4 transition-all"
            />
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-11 rounded-full font-medium text-[15px] shadow-sm transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
            </Button>
            <div className="mt-6 text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
