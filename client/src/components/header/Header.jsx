import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { logout } from "../../features/auth/authSlice";
import { useLogoutMutation } from "../../app/api/userApi";
import { cn, getAvatarUrl } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  X,
  ChevronDown,
  Settings,
  BookMarked,
  TrendingUp,
} from "lucide-react";

// Modals
import { CreatePostModal } from "../modals/CreatePostModal";
import { CreateCommunityModal } from "../modals/CreateCommunityModal";

/* ─── Navigation Data ────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/explore", label: "Explore", Icon: Compass, exact: false },
  { to: "/communities", label: "Communities", Icon: Users, exact: false },
];

/* ─── Helpers ────────────────────────────────────────────── */
function useActive() {
  const { pathname } = useLocation();
  return (to, exact) => (exact ? pathname === to : pathname.startsWith(to));
}

/** True once the user has scrolled past `threshold` pixels */
function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/* ─── Desktop Nav Link ───────────────────────────────────── */
const DesktopNavLink = ({ to, label, Icon, exact }) => {
  const isActive = useActive()(to, exact);
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/70",
      )}
    >
      <Icon size={15} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
      {label}
    </Link>
  );
};

/* ─── Mobile Nav Link ────────────────────────────────────── */
const MobileNavLink = ({ to, label, Icon, exact, onClick }) => {
  const isActive = useActive()(to, exact);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
      )}
    >
      <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
      {label}
    </Link>
  );
};

/* ─── Notification Badge ─────────────────────────────────── */
const NotificationBadge = ({ count }) => {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground border-2 border-background">
      {count > 9 ? "9+" : count}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN HEADER
══════════════════════════════════════════════════════════ */
export default function Header() {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutServer] = useLogoutMutation();
  const { theme, setTheme } = useTheme();
  const isActive = useActive();
  const scrolled = useScrolled(8);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile sheet on route change
  const { pathname } = useLocation();
  useEffect(() => setMobileOpen(false), [pathname]);

  /* ── Handlers ── */
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logoutServer().unwrap();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      dispatch(logout());
      navigate("/login");
      setIsLoggingOut(false);
    }
  }, [logoutServer, dispatch, navigate]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const closeMobile = () => setMobileOpen(false);

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled
            ? "border-b border-border/60 bg-background/90 backdrop-blur-lg shadow-sm"
            : "border-b border-transparent bg-background/70 backdrop-blur-sm",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6 max-w-[1600px] mx-auto">
          {/* ════════════ LEFT: Logo + Mobile Trigger + Desktop Nav ════════════ */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile Hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="xl:hidden h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                  aria-label="Open navigation menu"
                >
                  <Menu size={18} />
                </Button>
              </SheetTrigger>

              {/* ── Mobile Sheet ── */}
              <SheetContent
                side="left"
                className="w-72 p-0 flex flex-col border-r bg-background/98 backdrop-blur-xl"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Main navigation menu</SheetDescription>
                </SheetHeader>

                {/* Sheet Header */}
                <div className="flex items-center justify-between px-5 h-14 border-b border-border/50 shrink-0">
                  <Link to="/" onClick={closeMobile}>
                    <img
                      src="/logo.png"
                      alt="Discussly"
                      className="h-16 w-auto object-contain"
                    />
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground"
                    onClick={closeMobile}
                  >
                    <X size={15} />
                  </Button>
                </div>

                {/* Sheet Body */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                  {/* Main Nav */}
                  <section>
                    <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      Navigate
                    </p>
                    <nav className="flex flex-col gap-0.5">
                      {NAV_ITEMS.map((item) => (
                        <MobileNavLink
                          key={item.to}
                          {...item}
                          onClick={closeMobile}
                        />
                      ))}
                    </nav>
                  </section>

                  {/* Create Section */}
                  {userInfo && (
                    <section>
                      <p className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Create
                      </p>
                      <div className="flex flex-col gap-0.5">
                        <CreatePostModal>
                          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full text-left">
                            <PenSquare size={17} />
                            New Post
                          </button>
                        </CreatePostModal>
                        <CreateCommunityModal>
                          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full text-left">
                            <Hash size={17} />
                            New Community
                          </button>
                        </CreateCommunityModal>
                      </div>
                    </section>
                  )}
                </div>

                {/* Sheet Footer */}
                <div className="p-4 border-t border-border/50 bg-muted/10 space-y-3">
                  {/* Theme toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2.5 rounded-xl font-medium"
                    onClick={toggleTheme}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>

                  {userInfo ? (
                    <>
                      {/* User card */}
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-border/50 bg-accent/20 hover:bg-accent/40 transition-colors text-left"
                        onClick={() => {
                          closeMobile();
                          navigate(`/profile/${userInfo.username}`);
                        }}
                      >
                        <Avatar className="h-9 w-9 border border-border/50 shadow-sm shrink-0">
                          <AvatarImage
                            src={getAvatarUrl(userInfo)}
                            alt={userInfo.username}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                            {userInfo.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">
                            u/{userInfo.username}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {userInfo.email}
                          </p>
                        </div>
                      </button>

                      {/* Sign out */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2.5 rounded-xl font-medium text-destructive hover:bg-destructive/8 hover:text-destructive"
                        disabled={isLoggingOut}
                        onClick={() => {
                          closeMobile();
                          handleLogout();
                        }}
                      >
                        <LogOut size={15} />
                        {isLoggingOut ? "Signing out…" : "Sign Out"}
                      </Button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-xl"
                        onClick={closeMobile}
                      >
                        <Link to="/login">Log in</Link>
                      </Button>
                      <Button
                        size="sm"
                        asChild
                        className="rounded-xl"
                        onClick={closeMobile}
                      >
                        <Link to="/register">
                          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                          Sign Up
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
              className="flex items-center transition-opacity hover:opacity-80"
            >
              <img
                src="/logo.png"
                alt="Discussly"
                className="h-16 w-auto object-contain"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-0.5 ml-2">
              {NAV_ITEMS.map((item) => (
                <DesktopNavLink key={item.to} {...item} />
              ))}
            </nav>
          </div>

          {/* ════════════ CENTER: Search ════════════ */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Open search"
            className="hidden md:flex flex-1 max-w-md mx-2 group cursor-pointer"
            onClick={() => navigate("/search")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/search")}
          >
            <div className="relative w-full flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors pointer-events-none" />
              <div
                className={cn(
                  "w-full h-9 pl-9 pr-10 rounded-xl border text-sm text-muted-foreground/60",
                  "select-none flex items-center transition-all duration-150",
                  "bg-muted/40 border-border/40",
                  "group-hover:bg-muted/70 group-hover:border-border/70 group-hover:text-muted-foreground",
                  "group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:border-primary/40",
                )}
              >
                Search discussions, communities…
              </div>
              <div className="absolute right-2.5 hidden lg:flex items-center gap-0.5">
                <kbd className="inline-flex h-5 items-center gap-0.5 rounded-md border border-border/60 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* ════════════ RIGHT: Actions ════════════ */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hidden sm:flex h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>

            {userInfo ? (
              <>
                {/* Notifications */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate("/notifications")}
                      className="relative h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                      aria-label="Notifications"
                    >
                      <Bell size={16} />
                      {/* Replace `3` with real unread count from your store */}
                      <NotificationBadge count={3} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Notifications</TooltipContent>
                </Tooltip>

                {/* Create Dropdown */}
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hidden sm:flex h-8 rounded-xl gap-1.5 px-3 border-dashed border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                          <span className="text-xs font-semibold hidden lg:inline">
                            Create
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Create</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent
                    align="end"
                    className="w-44 rounded-xl shadow-lg border-border/60"
                  >
                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 pb-1">
                      Create new
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <CreatePostModal>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer rounded-lg"
                        >
                          <PenSquare className="mr-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          New Post
                        </DropdownMenuItem>
                      </CreatePostModal>
                      <CreateCommunityModal>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="cursor-pointer rounded-lg"
                        >
                          <Hash className="mr-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          New Community
                        </DropdownMenuItem>
                      </CreateCommunityModal>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Separator
                  orientation="vertical"
                  className="hidden lg:block h-5 mx-1 opacity-40"
                />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 gap-1.5 px-1.5 rounded-xl hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <Avatar className="h-7 w-7 border border-border/50 shadow-sm">
                        <AvatarImage
                          src={getAvatarUrl(userInfo)}
                          alt={userInfo.username}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[11px] font-black bg-primary/10 text-primary">
                          {userInfo.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown
                        size={12}
                        className="hidden sm:block text-muted-foreground/60"
                      />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-56 rounded-xl shadow-lg border-border/60"
                    align="end"
                    forceMount
                  >
                    {/* User info */}
                    <div className="flex items-center gap-2.5 p-3 border-b border-border/40">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage
                          src={getAvatarUrl(userInfo)}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {userInfo.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          u/{userInfo.username}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>

                    <div className="p-1">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg gap-2.5"
                          onClick={() =>
                            navigate(`/profile/${userInfo.username}`)
                          }
                        >
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg gap-2.5"
                          onClick={() => navigate("/settings")}
                        >
                          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg gap-2.5"
                          onClick={() => navigate("/saved")}
                        >
                          <BookMarked className="h-3.5 w-3.5 text-muted-foreground" />
                          Saved Posts
                        </DropdownMenuItem>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="my-1 opacity-50" />

                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg gap-2.5 text-destructive focus:bg-destructive/8 focus:text-destructive"
                        disabled={isLoggingOut}
                        onClick={handleLogout}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        {isLoggingOut ? "Signing out…" : "Sign out"}
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* ── Logged Out ── */
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden sm:flex h-8 rounded-xl text-muted-foreground hover:text-foreground font-semibold"
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="h-8 rounded-xl px-4 shadow-sm font-semibold"
                >
                  <Link to="/register">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
