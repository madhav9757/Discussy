import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  MessageSquare,
  Plus,
  User,
  LogOut,
  Compass,
  Info,
  Sun,
  Moon,
  Settings,
  Shield,
  LayoutGrid,
  Menu,
  ChevronDown,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import SearchBar from "../SearchBar/SearchBar";
import NotificationDropdown from "./NotificationDropdown/NotificationDropdown";
import { logoutUser } from "../../features/auth/authSlice";
import { cn } from "@/lib/utils";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved
      ? JSON.parse(saved)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const user = useSelector((state) => state.auth.userInfo);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const navItems = [
    { label: "Explore", path: "/explore", icon: Compass },
    { label: "Hubs", path: "/community", icon: LayoutGrid },
    { label: "About", path: "/about", icon: Info },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b border-border/40",
        isScrolled
          ? "bg-background/80 backdrop-blur-md py-2"
          : "bg-background py-3",
      )}
    >
      <div className="container flex items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-foreground text-background p-1.5 rounded-md">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tighter uppercase">
              Discussly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all rounded-md relative",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-1 left-4 right-4 h-0.5 bg-foreground rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:block w-64">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Separator
              orientation="vertical"
              className="h-4 mx-1 hidden sm:block opacity-40"
            />

            {!user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[10px] font-bold uppercase tracking-widest px-4 h-9"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="text-[10px] font-bold uppercase tracking-widest px-5 h-9 rounded-md"
                >
                  <Link to="/register">Join Us</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:flex items-center gap-2 px-5 h-9 rounded-md text-[10px] font-bold uppercase tracking-widest"
                >
                  <Link to="/new-post">
                    <Plus className="h-3.5 w-3.5" />
                    Create
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none group">
                      <Avatar className="h-8 w-8 rounded-md border border-border/60">
                        <AvatarImage src={user.image} />
                        <AvatarFallback className="text-[10px] bg-muted font-black">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-3 w-3 text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 mt-2 border-2 shadow-none rounded-md p-2"
                    align="end"
                  >
                    <DropdownMenuLabel className="px-3 py-3 border-b mb-1">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-black uppercase tracking-tight overflow-hidden text-ellipsis">
                          u/{user.username}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 overflow-hidden text-ellipsis italic">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      asChild
                      className="rounded-md h-10 px-3 cursor-pointer text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Link to="/profile">
                        <User className="mr-3 h-3.5 w-3.5" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-md h-10 px-3 cursor-pointer text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Link to="/settings">
                        <Settings className="mr-3 h-3.5 w-3.5" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem
                        asChild
                        className="rounded-md h-10 px-3 cursor-pointer text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Link to="/admin">
                          <Shield className="mr-3 h-3.5 w-3.5" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-md h-10 px-3 cursor-pointer text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10!"
                    >
                      <LogOut className="mr-3 h-3.5 w-3.5" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-8 border-l-2">
                <SheetHeader className="text-left pb-6 border-b-2 border-foreground/5">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="bg-foreground text-background p-1 rounded-sm">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="font-black uppercase tracking-tighter text-lg">
                      Discussly
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-8 py-8">
                  <SearchBar />
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-4 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-muted transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <Separator className="opacity-40" />
                  <div className="flex flex-col gap-3">
                    {user ? (
                      <>
                        <Button
                          asChild
                          className="w-full justify-start gap-4 h-12 rounded-md font-bold uppercase tracking-[0.2em] text-[10px]"
                        >
                          <Link to="/new-post">
                            <Plus className="h-4 w-4" /> Create Post
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full justify-start gap-4 h-12 rounded-md font-bold uppercase tracking-[0.2em] text-[10px] border-2 text-destructive border-destructive/20 hover:bg-destructive/5"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          asChild
                          className="w-full h-12 rounded-md font-bold uppercase tracking-[0.2em] text-[10px]"
                        >
                          <Link to="/register">Create Account</Link>
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full h-12 rounded-md font-bold uppercase tracking-[0.2em] text-[10px] border-2"
                        >
                          <Link to="/login">Sign In</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
