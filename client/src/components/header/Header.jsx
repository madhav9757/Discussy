import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { logout } from "../../features/auth/authSlice";
import { Button } from "../ui/button";
import {
  Search,
  Home,
  Compass,
  Users,
  Bell,
  LogOut,
  Moon,
  Sun,
  Plus,
  PenSquare,
  Hash,
} from "lucide-react";
import { CreatePostModal } from "../modals/CreatePostModal";
import { CreateCommunityModal } from "../modals/CreateCommunityModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navLinkClass = (path) =>
    `flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all hover:shadow-sm ${
      isActive(path)
        ? "bg-background text-primary shadow-sm"
        : "text-muted-foreground hover:bg-background hover:text-primary"
    }`;

  // State controls for our modals opened from Dropdown
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-7xl gap-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-8 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-all duration-300"
          >
            <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 group-hover:rotate-6 group-hover:scale-110 transition-all">
              D
            </div>
            <span className="font-black text-xl tracking-tight hidden lg:block bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Discussly
            </span>
          </Link>

          {/* Nav Links - Desktop only */}
          <nav className="hidden xl:flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/40">
            <Link to="/" className={navLinkClass("/")}>
              <Home size={17} /> Home
            </Link>
            <Link to="/explore" className={navLinkClass("/explore")}>
              <Compass size={17} /> Explore
            </Link>
            <Link to="/communities" className={navLinkClass("/communities")}>
              <Users size={17} /> Communities
            </Link>
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group" onClick={() => navigate("/search")}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              readOnly
              className="w-full pl-11 h-11 text-[13px] rounded-2xl border-none bg-muted/50 hover:bg-muted/80 focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer placeholder:text-muted-foreground/60 font-medium"
              placeholder="Search Discussly..."
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-1">
              <span className="text-[10px] font-bold bg-background/50 border border-border/40 px-1.5 py-0.5 rounded-md text-muted-foreground/40 leading-none">
                /
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {userInfo ? (
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex items-center gap-1 md:bg-muted/30 md:p-1 md:rounded-2xl md:border md:border-border/40">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/notifications")}
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all relative"
                >
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all"
                    >
                      <Plus className="h-[18px] w-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-2xl p-2 border-border/60 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                  >
                    <DropdownMenuItem
                      className="rounded-xl p-3 cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <CreatePostModal>
                        <div className="flex items-center w-full font-semibold">
                          <PenSquare className="w-4 h-4 mr-3 text-primary/70" />{" "}
                          <span>New Post</span>
                        </div>
                      </CreatePostModal>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="rounded-xl p-3 cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <CreateCommunityModal>
                        <div className="flex items-center w-full font-semibold">
                          <Hash className="w-4 h-4 mr-3 text-primary/70" />{" "}
                          <span>New Community</span>
                        </div>
                      </CreateCommunityModal>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9 rounded-xl hover:bg-background hover:text-primary transition-all hidden sm:flex"
                >
                  {theme === "dark" ? (
                    <Sun className="h-[18px] w-[18px]" />
                  ) : (
                    <Moon className="h-[18px] w-[18px]" />
                  )}
                </Button>
              </div>

              <div className="h-8 w-px bg-border/40 mx-1 hidden lg:block"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="group flex items-center gap-2.5 p-1 pr-3 rounded-2xl border border-border/40 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all hover:border-primary/20">
                    <div className="h-8 w-8 rounded-xl bg-background border border-border/50 overflow-hidden shadow-sm group-hover:shadow-primary/10">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userInfo.username}`}
                        alt="Profile"
                        className="w-full h-full p-1"
                      />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold leading-none">
                        {userInfo.username}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-none capitalize">
                        {userInfo.username?.length % 2 === 0
                          ? "Contributor"
                          : "Author"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl p-2 border-border/60 shadow-2xl pb-2"
                >
                  <div className="px-3 py-3 border-b border-border/40 mb-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                      Account
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 overflow-hidden">
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userInfo.username}`}
                          alt="Profile"
                          className="w-full h-full p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          @{userInfo.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuItem
                    className="rounded-xl p-3 cursor-pointer mb-1 group"
                    onClick={() => navigate(`/profile/${userInfo._id}`)}
                  >
                    <Users className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />{" "}
                    <span className="font-semibold">My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-xl p-3 cursor-pointer group"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-3 text-destructive group-hover:animate-pulse" />{" "}
                    <span className="font-semibold text-destructive">
                      Sign Out
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-bold hover:text-primary px-2 transition-colors"
              >
                Log in
              </Link>
              <Button
                asChild
                className="h-10 px-6 font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Link to="/register">Join Platform</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
