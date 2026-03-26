import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../app/api/userApi";
import { cn, getAvatarUrl } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Icons
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
  Menu,
  Sparkles,
  User,
} from "lucide-react";

// Modals
import { CreatePostModal } from "../modals/CreatePostModal";
import { CreateCommunityModal } from "../modals/CreateCommunityModal";

/* ─── Navigation Data ───────────────────────────────── */
const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/explore", label: "Explore", Icon: Compass, exact: false },
  { to: "/communities", label: "Communities", Icon: Users, exact: false },
];

/* ─── Helpers ────────────────────────────────────────── */
function useActive() {
  const { pathname } = useLocation();
  return (to, exact) => (exact ? pathname === to : pathname.startsWith(to));
}

/* ─── Main Component ─────────────────────────────────── */
export default function Header() {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutServer] = useLogoutMutation();
  const { theme, setTheme } = useTheme();
  const isActive = useActive();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutServer().unwrap();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  /* ── Desktop Nav Link ── */
  const DesktopNavLink = ({ to, label, Icon, exact }) => {
    const active = isActive(to, exact);
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  /* ── Mobile Nav Link ── */
  const MobileNavLink = ({ to, label, Icon, exact }) => {
    const active = isActive(to, exact);
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8 max-w-[1600px] mx-auto">
        {/* ════════════════ LEFT: Logo & Mobile Trigger ════════════════ */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Mobile Hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden h-9 w-9 text-muted-foreground"
              >
                <Menu size={20} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            {/* Mobile Sheet Content */}
            <SheetContent
              side="left"
              className="w-72 p-0 flex flex-col border-r bg-background"
            >
              <div className="flex items-center px-6 h-16 border-b shrink-0">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <img
                    src="/logo.png"
                    alt="Discussly"
                    className="h-20 w-auto object-contain"
                  />
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* Main Nav */}
                <nav className="flex flex-col gap-1">
                  <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu
                  </p>
                  {NAV_ITEMS.map((item) => (
                    <MobileNavLink key={item.to} {...item} />
                  ))}
                </nav>

                {/* Create Section */}
                {userInfo && (
                  <div className="flex flex-col gap-1">
                    <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Create
                    </p>
                    <CreatePostModal>
                      <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full">
                        <PenSquare size={18} /> New Post
                      </button>
                    </CreatePostModal>
                    <CreateCommunityModal>
                      <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full">
                        <Hash size={18} /> New Community
                      </button>
                    </CreateCommunityModal>
                  </div>
                )}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t bg-muted/20 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>

                {userInfo ? (
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-3 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={18} /> Sign Out
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      asChild
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link to="/login">Log in</Link>
                    </Button>
                    <Button asChild onClick={() => setMobileOpen(false)}>
                      <Link to="/register">
                        <Sparkles className="mr-2 h-4 w-4" /> Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Logo */}
          <Link
            to="/"
            className="flex items-center transition-transform hover:scale-105"
          >
            <img
              src="/logo.png"
              alt="Discussly"
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1 ml-4">
            {NAV_ITEMS.map((item) => (
              <DesktopNavLink key={item.to} {...item} />
            ))}
          </nav>
        </div>

        {/* ════════════════ CENTER: Search ════════════════ */}
        <div
          className="hidden md:flex flex-1 max-w-lg mx-4 group cursor-pointer"
          onClick={() => navigate("/search")}
        >
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="w-full h-10 pl-10 pr-12 rounded-full border bg-muted/40 group-hover:bg-muted/80 group-hover:border-primary/30 transition-all flex items-center text-sm text-muted-foreground select-none">
              Search discussions, communities...
            </div>
            <div className="absolute right-3 hidden lg:flex items-center">
              <kbd className="inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT: Actions ════════════════ */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle (Desktop) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {userInfo ? (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/notifications")}
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background animate-pulse" />
              </Button>

              {/* Create Menu (Desktop) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden sm:flex rounded-full border-dashed border-muted-foreground/40 hover:border-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Plus size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <CreatePostModal>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer"
                      >
                        <PenSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>New Post</span>
                      </DropdownMenuItem>
                    </CreatePostModal>
                    <CreateCommunityModal>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer"
                      >
                        <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>New Community</span>
                      </DropdownMenuItem>
                    </CreateCommunityModal>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator
                orientation="vertical"
                className="hidden lg:block h-6 mx-2"
              />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage
                        src={getAvatarUrl(userInfo)}
                        alt={userInfo.username}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {userInfo.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        u/{userInfo.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userInfo.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate(`/profile/${userInfo.username}`)}
                    >
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Logged Out State */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="hidden sm:flex text-muted-foreground hover:text-foreground"
              >
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="rounded-full px-5 shadow-sm">
                <Link to="/register">
                  <Sparkles className="mr-1.5 h-4 w-4" /> Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
