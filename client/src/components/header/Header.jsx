import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  MessageCircle,
  Plus,
  UserCircle,
  LogOut,
  Home,
  Compass,
  Info,
  Sun,
  Moon,
  Settings,
  Shield,
  Network,
  Menu,
  Sparkles
} from 'lucide-react';

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import SearchBar from '../SearchBar/SearchBar';
import NotificationDropdown from './NotificationDropdown/NotificationDropdown';
import { logoutUser } from '../../features/auth/authSlice';
import { cn } from "@/lib/utils";

const Header = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const user = useSelector(state => state.auth.userInfo);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home, color: 'text-blue-500' },
    { label: 'Explore', path: '/explore', icon: Compass, color: 'text-purple-500' },
    { label: 'Communities', path: '/community', icon: Network, color: 'text-emerald-500' },
    { label: 'About', path: '/about', icon: Info, color: 'text-slate-500' },
  ];

  return (
    <TooltipProvider>
      <header className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm py-2" 
          : "bg-background border-transparent py-4"
      )}>
        <div className="container flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
          
          {/* Logo Section */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-active:scale-95">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-xl tracking-tighter hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Discussly
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "relative px-4 py-2 text-sm font-medium transition-all hover:text-primary rounded-lg flex items-center gap-2 group",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", item.color)} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-primary/5 border border-primary/10 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block mr-2">
              <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
            </div>

            <div className="flex items-center space-x-1">
              <NotificationDropdown />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-full w-9 h-9">
                    {isDarkMode ? (
                      <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 rotate-0 scale-100 transition-all" />
                    ) : (
                      <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-500 rotate-0 scale-100 transition-all" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Theme</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6 mx-2 hidden sm:block" />

              {!user ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex font-semibold">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild className="font-semibold shadow-md shadow-primary/10">
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button asChild size="sm" className="hidden sm:flex items-center gap-2 rounded-full px-4 font-semibold shadow-lg shadow-primary/15">
                    <Link to="/new-post">
                      <Plus className="h-4 w-4 stroke-[3px]" />
                      <span>Post</span>
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border border-border/50 hover:border-primary/50 transition-all">
                        <Avatar className="h-full w-full">
                          <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                          <AvatarFallback className="bg-primary/5">{user.username.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 mt-2" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal p-4">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-bold leading-none">{user.username}</p>
                          <p className="text-xs leading-none text-muted-foreground mt-1 truncate">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="py-2.5 cursor-pointer">
                        <Link to="/profile">
                          <UserCircle className="mr-3 h-4 w-4 text-blue-500" /> My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="py-2.5 cursor-pointer">
                        <Link to="/settings">
                          <Settings className="mr-3 h-4 w-4 text-slate-500" /> Settings
                        </Link>
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild className="py-2.5 cursor-pointer">
                          <Link to="/admin">
                            <Shield className="mr-3 h-4 w-4 text-rose-500" /> Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="py-2.5 text-destructive focus:bg-destructive/10 cursor-pointer font-bold">
                        <LogOut className="mr-3 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden ml-1">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[350px] flex flex-col">
                  <SheetHeader className="pb-6 border-b text-left">
                    <SheetTitle className="flex items-center gap-3">
                      <div className="bg-primary p-1.5 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="font-bold tracking-tight text-xl">Discussly</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto py-6 space-y-8">
                    <div className="space-y-1">
                      {navItems.map((item) => (
                        <Button key={item.path} variant="ghost" asChild className="w-full justify-start text-lg h-14 rounded-xl px-4">
                          <Link to={item.path}>
                            <item.icon className={cn("mr-4 h-5 w-5", item.color)} />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-4 px-2">
                       <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
                       {user ? (
                         <div className="grid gap-3">
                           <Button asChild className="w-full h-12 justify-start px-6 rounded-xl">
                             <Link to="/new-post">
                               <Plus className="mr-3 h-5 w-5" /> Create Post
                             </Link>
                           </Button>
                           <Button variant="outline" onClick={handleLogout} className="w-full h-12 justify-start px-6 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5">
                             <LogOut className="mr-3 h-5 w-5" /> Logout
                           </Button>
                         </div>
                       ) : (
                        <div className="flex flex-col gap-3">
                           <Button asChild className="w-full h-12 rounded-xl">
                             <Link to="/register">Create Account</Link>
                           </Button>
                           <Button variant="outline" asChild className="w-full h-12 rounded-xl">
                             <Link to="/login">Sign In</Link>
                           </Button>
                        </div>
                       )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;