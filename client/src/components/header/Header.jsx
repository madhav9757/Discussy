import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "next-themes";
import { logout } from "../../features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Menu,
  Sparkles,
} from "lucide-react";
import { CreatePostModal } from "../modals/CreatePostModal";
import { CreateCommunityModal } from "../modals/CreateCommunityModal";
import { cn } from "@/lib/utils";

import { useLogoutMutation } from "../../app/api/userApi";

/* ─── nav items ─────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/explore", label: "Explore", Icon: Compass, exact: false },
  { to: "/communities", label: "Communities", Icon: Users, exact: false },
];

/* ─── helpers ────────────────────────────────────────── */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [threshold]);
  return scrolled;
}

function useActive() {
  const { pathname } = useLocation();
  return (to, exact) => (exact ? pathname === to : pathname.startsWith(to));
}

/* ─── main component ─────────────────────────────────── */
export default function Header() {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutServer] = useLogoutMutation();
  const { theme, setTheme } = useTheme();
  const scrolled = useScrolled();
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

  /* ── Desktop nav link ── */
  const DesktopNavLink = ({ to, label, Icon, exact }) => {
    const active = isActive(to, exact);
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150",
          active
            ? "bg-foreground text-background shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        <Icon size={13} strokeWidth={2.4} />
        {label}
      </Link>
    );
  };

  /* ── Mobile nav link ── */
  const MobileNavLink = ({ to, label, Icon, exact }) => {
    const active = isActive(to, exact);
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150",
          active
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        <Icon size={16} strokeWidth={2.2} />
        {label}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/90 backdrop-blur-xl shadow-sm"
          : "border-b border-border/30 bg-background/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
        {/* ════════════════ LEFT ════════════════ */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Hamburger — hidden on xl+ */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Menu size={18} strokeWidth={2} />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            {/* ── Mobile sheet ── */}
            <SheetContent
              side="left"
              className="w-72 p-0 flex flex-col border-r border-border/50 bg-background"
            >
              {/* Sheet header */}
              <div className="flex items-center px-5 h-14 border-b border-border/40 shrink-0">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-[15px] tracking-tight select-none">
                    D
                  </div>
                  <span className="font-black text-[17px] tracking-tight text-foreground">
                    Discussly
                  </span>
                </Link>
              </div>

              {/* Nav */}
              <nav className="flex flex-col gap-0.5 px-3 pt-5">
                <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none">
                  Navigation
                </p>
                {NAV_ITEMS.map((item) => (
                  <MobileNavLink key={item.to} {...item} />
                ))}
              </nav>

              {/* Create */}
              {userInfo && (
                <>
                  <Separator className="mx-4 mt-5 mb-4 w-auto" />
                  <div className="flex flex-col gap-0.5 px-3">
                    <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none">
                      Create
                    </p>
                    <CreatePostModal>
                      <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full text-left">
                        <PenSquare size={16} strokeWidth={2} />
                        New Post
                      </button>
                    </CreatePostModal>
                    <CreateCommunityModal>
                      <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full text-left">
                        <Hash size={16} strokeWidth={2} />
                        New Community
                      </button>
                    </CreateCommunityModal>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="mt-auto px-3 pb-6">
                <Separator className="mb-4 w-auto" />
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all w-full"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun size={16} strokeWidth={2} />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={16} strokeWidth={2} />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
                {userInfo ? (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all w-full mt-0.5"
                  >
                    <LogOut size={16} strokeWidth={2} />
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 mt-2 px-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center h-10 rounded-xl border border-border/60 text-sm font-semibold text-foreground hover:bg-accent transition-all"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all"
                    >
                      <Sparkles size={13} strokeWidth={2.5} />
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-black text-[15px] tracking-tight select-none shadow-sm group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-200">
              D
            </div>
            <span className="hidden lg:block font-black text-[17px] tracking-tight text-foreground">
              Discussly
            </span>
          </Link>

          {/* Desktop nav — xl+ only */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <DesktopNavLink key={item.to} {...item} />
            ))}
          </nav>
        </div>

        {/* ════════════════ CENTER: Search ════════════════ */}
        <div
          className="hidden md:block flex-1 max-w-sm cursor-pointer group"
          onClick={() => navigate("/search")}
        >
          <div className="relative w-full">
            <Search
              size={13}
              strokeWidth={2.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors pointer-events-none"
            />
            <div className="w-full h-9 pl-9 pr-10 flex items-center rounded-lg border border-border/40 bg-muted/30 group-hover:bg-muted/60 group-hover:border-border/60 transition-all text-[12.5px] text-muted-foreground/50 font-medium select-none">
              Search discussions, communities…
            </div>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-1.5 py-0.5 rounded border border-border/50 bg-background/60 text-[9.5px] font-bold text-muted-foreground/40 leading-none">
              /
            </kbd>
          </div>
        </div>

        {/* ════════════════ RIGHT ════════════════ */}
        <div className="flex items-center gap-1 shrink-0">
          {userInfo ? (
            <>
              {/* Bell */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/notifications")}
                className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <Bell size={16} strokeWidth={2} />
                <span className="absolute top-[9px] right-[9px] w-[6px] h-[6px] rounded-full bg-orange-500 border-[1.5px] border-background animate-pulse" />
              </Button>

              {/* Create + (desktop) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    <Plus size={17} strokeWidth={2.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-48 rounded-xl p-1.5 border-border/50 shadow-xl"
                >
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-[12.5px] font-semibold cursor-pointer gap-2.5 focus:bg-accent"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <CreatePostModal>
                      <div className="flex items-center gap-2.5 w-full">
                        <PenSquare
                          size={13}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                        New Post
                      </div>
                    </CreatePostModal>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-[12.5px] font-semibold cursor-pointer gap-2.5 focus:bg-accent"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <CreateCommunityModal>
                      <div className="flex items-center gap-2.5 w-full">
                        <Hash
                          size={13}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                        New Community
                      </div>
                    </CreateCommunityModal>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden sm:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                {theme === "dark" ? (
                  <Sun size={15} strokeWidth={2} />
                ) : (
                  <Moon size={15} strokeWidth={2} />
                )}
              </Button>

              {/* Divider */}
              <div className="hidden lg:block w-px h-5 bg-border/50 mx-1" />

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/50 hover:border-border/60 transition-all cursor-pointer outline-none ring-0">
                    <div className="h-7 w-7 rounded-lg overflow-hidden border border-border/40 bg-muted shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userInfo.username}`}
                        alt={userInfo.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="hidden lg:block text-[12.5px] font-semibold text-foreground">
                      {userInfo.username}
                    </span>
                    <ChevronDown
                      size={11}
                      strokeWidth={2.5}
                      className="text-muted-foreground group-data-[state=open]:rotate-180 transition-transform duration-200"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-56 rounded-xl p-1.5 border-border/50 shadow-xl"
                >
                  {/* Profile card */}
                  <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg bg-muted/40">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-border/40 shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userInfo.username}`}
                        alt={userInfo.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold truncate text-foreground">
                        u/{userInfo.username}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                        {userInfo.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-[12.5px] font-semibold cursor-pointer gap-2.5 focus:bg-accent"
                    onClick={() => navigate(`/profile/${userInfo._id}`)}
                  >
                    <Users
                      size={13}
                      strokeWidth={2}
                      className="text-muted-foreground"
                    />
                    My Profile
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                  <DropdownMenuItem
                    className="rounded-lg px-3 py-2 text-[12.5px] font-semibold cursor-pointer gap-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut size={13} strokeWidth={2} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* ── Logged out ── */
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hidden sm:flex h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                {theme === "dark" ? (
                  <Sun size={15} strokeWidth={2} />
                ) : (
                  <Moon size={15} strokeWidth={2} />
                )}
              </Button>
              <Link
                to="/login"
                className="hidden sm:block text-[12.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                Log in
              </Link>
              <Button
                asChild
                size="sm"
                className="h-9 px-4 rounded-lg text-[12.5px] font-bold shadow-sm"
              >
                <Link to="/register" className="flex items-center gap-1.5">
                  <Sparkles size={12} strokeWidth={2.5} />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
