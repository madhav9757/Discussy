import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useGetCommunitiesQuery } from "../app/api/communitiesApi";
import {
  Users,
  Hash,
  Search,
  Plus,
  TrendingUp,
  ChevronRight,
  Flame,
  Sparkles,
  Globe,
  LayoutGrid,
  List,
  Compass,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Check,
  ArrowRight,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CreateCommunityModal } from "../components/modals/CreateCommunityModal";
import { cn, getCommunityIconUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { value: "members", label: "Most Members" },
  { value: "newest", label: "Newest First" },
  { value: "az", label: "A → Z" },
];

const HOT_THRESHOLD = 500;

/* ═══════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */
const fmt = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n ?? 0);
};

/** Simple debounce hook */
function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ═══════════════════════════════════════════════════════
   SKELETON
════════════════════════════════════════════════════════ */
const GridSkeleton = () => (
  <Card className="p-4 shadow-none border-border/50">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
    <Skeleton className="h-2.5 w-full mb-1.5" />
    <Skeleton className="h-2.5 w-3/4 mb-3" />
    <div className="flex gap-1.5">
      <Skeleton className="h-4 w-14 rounded-full" />
      <Skeleton className="h-4 w-10 rounded-full" />
    </div>
  </Card>
);

const ListSkeleton = () => (
  <Card className="shadow-none border-border/50">
    <CardContent className="p-3 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <Skeleton className="h-7 w-16 rounded-lg" />
    </CardContent>
  </Card>
);

/* ═══════════════════════════════════════════════════════
   COMMUNITY BADGES
════════════════════════════════════════════════════════ */
const CommunityBadges = ({ community, className }) => (
  <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
    {community.category && (
      <Badge
        variant="secondary"
        className="text-[10px] h-4 px-1.5 font-semibold rounded-md gap-0.5"
      >
        <Hash className="w-2.5 h-2.5 opacity-60" />
        {community.category}
      </Badge>
    )}
    {community.isNew && (
      <Badge
        variant="outline"
        className="text-[10px] h-4 px-1.5 font-semibold rounded-md text-sky-500 border-sky-500/25 bg-sky-500/8 gap-0.5"
      >
        <Sparkles className="w-2.5 h-2.5" />
        New
      </Badge>
    )}
    {(community.members?.length || 0) >= HOT_THRESHOLD && (
      <Badge
        variant="outline"
        className="text-[10px] h-4 px-1.5 font-semibold rounded-md text-orange-500 border-orange-500/25 bg-orange-500/8 gap-0.5"
      >
        <Flame className="w-2.5 h-2.5" />
        Hot
      </Badge>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   GRID CARD
════════════════════════════════════════════════════════ */
const CommunityGridCard = ({ community, onClick, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.97 }}
    transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.24) }}
    whileHover={{ y: -2, transition: { duration: 0.12 } }}
    onClick={onClick}
    className="h-full cursor-pointer"
  >
    <Card className="group h-full hover:border-primary/40 hover:shadow-md transition-all duration-200 shadow-none border-border/50 bg-card/80 flex flex-col overflow-hidden">
      <CardContent className="p-4 flex flex-col h-full gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 rounded-xl border border-border/40 shadow-sm shrink-0">
              <AvatarImage
                src={getCommunityIconUrl(community)}
                alt={community.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-xl text-xs font-bold bg-primary/10 text-primary">
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                c/{community.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                <Users className="w-2.5 h-2.5 shrink-0" />
                <span className="text-[11px] font-medium">
                  {fmt(community.members?.length || 0)} members
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {community.description ||
            "Explore and connect with members in this growing community."}
        </p>

        {/* Badges */}
        <CommunityBadges community={community} />
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════
   LIST ROW
════════════════════════════════════════════════════════ */
const CommunityListRow = ({ community, onClick, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 6 }}
    transition={{ duration: 0.15, delay: Math.min(index * 0.025, 0.2) }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <Card className="group hover:border-primary/35 hover:shadow-sm transition-all duration-200 shadow-none border-border/50 bg-card/80">
      <CardContent className="p-3 flex items-center gap-3.5">
        <Avatar className="w-10 h-10 rounded-xl border border-border/40 shrink-0">
          <AvatarImage
            src={getCommunityIconUrl(community)}
            className="object-cover"
          />
          <AvatarFallback className="rounded-xl text-xs font-bold bg-primary/10 text-primary">
            {community.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Name + desc */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              c/{community.name}
            </span>
            <CommunityBadges community={community} />
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
            {community.description || "Join this community today."}
          </p>
        </div>

        {/* Member count */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-medium min-w-[90px] justify-end shrink-0">
          <Users className="w-3 h-3" />
          {fmt(community.members?.length || 0)}
        </div>

        {/* CTA */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-3 font-semibold rounded-lg shrink-0 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          Join
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════
   SIDEBAR CONTENT (shared between desktop + mobile sheet)
════════════════════════════════════════════════════════ */
const SidebarContent = ({
  categories,
  categoryCounts,
  activeFilter,
  setActiveFilter,
  topCommunities,
  navigate,
  onClose,
}) => (
  <div className="space-y-6 py-5 px-4">
    {/* Categories */}
    <section>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pb-2">
        Browse
      </p>
      <nav className="space-y-0.5">
        {["all", ...categories].map((cat) => {
          const active = activeFilter === cat;
          const count = cat === "all" ? undefined : categoryCounts[cat];
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat);
                onClose?.();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-2.5">
                {cat === "all" ? (
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Hash className="w-3.5 h-3.5 shrink-0 opacity-70" />
                )}
                <span className="capitalize">{cat}</span>
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {cat === "all" ? "All" : (count ?? "—")}
              </span>
            </button>
          );
        })}
      </nav>
    </section>

    <Separator className="opacity-40" />

    {/* Trending */}
    <section>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 pb-2 flex items-center gap-1.5">
        <TrendingUp className="w-3 h-3" />
        Trending
      </p>
      <div className="space-y-0.5">
        {topCommunities.map((c, i) => (
          <button
            key={c._id}
            onClick={() => {
              navigate(`/communities/${c.name}`);
              onClose?.();
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-accent/60 transition-colors group text-left"
          >
            <span className="text-[10px] font-black text-muted-foreground/40 w-4 text-center shrink-0">
              {i + 1}
            </span>
            <Avatar className="w-6 h-6 rounded-lg border border-border/40 shrink-0">
              <AvatarImage
                src={getCommunityIconUrl(c)}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg text-[9px] font-bold">
                {c.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                c/{c.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {fmt(c.members?.length || 0)} members
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  </div>
);

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════ */
const EmptyState = ({ query, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center mb-4">
      <Search className="w-6 h-6 text-muted-foreground/50" />
    </div>
    <h3 className="text-base font-bold mb-1.5">No communities found</h3>
    <p className="text-sm text-muted-foreground mb-5 max-w-xs">
      {query
        ? `No results for "${query}". Try a different search term.`
        : "No communities match the current filters."}
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={onClear}
      className="rounded-xl gap-1.5 font-semibold"
    >
      <X className="w-3.5 h-3.5" />
      Clear Filters
    </Button>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
const Communities = () => {
  const { data: communities = [], isLoading } = useGetCommunitiesQuery();
  const navigate = useNavigate();

  const [rawQuery, setRawQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("members");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const query = useDebounce(rawQuery, 220);
  const searchRef = useRef(null);

  /* ── Keyboard shortcut: / focuses search ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Derived data ── */
  const categories = useMemo(() => {
    const cats = [
      ...new Set(communities.map((c) => c.category).filter(Boolean)),
    ];
    return cats.sort().slice(0, 10);
  }, [communities]);

  const categoryCounts = useMemo(() => {
    return communities.reduce((acc, c) => {
      if (c.category) acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
  }, [communities]);

  const topCommunities = useMemo(
    () =>
      [...communities]
        .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
        .slice(0, 5),
    [communities],
  );

  const sorted = useMemo(() => {
    const arr = [...communities];
    if (sortBy === "members")
      return arr.sort(
        (a, b) => (b.members?.length || 0) - (a.members?.length || 0),
      );
    if (sortBy === "newest")
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "az")
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [communities, sortBy]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return sorted.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q);
      const matchesFilter =
        activeFilter === "all" ||
        c.category?.toLowerCase() === activeFilter.toLowerCase();
      return matchesQuery && matchesFilter;
    });
  }, [sorted, query, activeFilter]);

  const clearFilters = useCallback(() => {
    setRawQuery("");
    setActiveFilter("all");
  }, []);

  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full h-[calc(100vh-56px)] bg-background flex flex-col overflow-hidden">
        {/* ══════════════════════════════════════
            PAGE HEADER
        ══════════════════════════════════════ */}
        <header className="px-5 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center justify-between gap-3">
            {/* Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Compass className="w-4 h-4 text-primary" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-black tracking-tight leading-none">
                  Communities
                </h1>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {isLoading ? "Loading…" : `${communities.length} spaces`}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
              <Input
                ref={searchRef}
                value={rawQuery}
                onChange={(e) => setRawQuery(e.target.value)}
                placeholder="Search communities…"
                className="pl-8 pr-8 h-8 text-xs bg-muted/50 border-border/40 hover:bg-muted/70 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 shadow-none rounded-xl transition-all"
              />
              {rawQuery && (
                <button
                  onClick={() => setRawQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile filter toggle */}
              <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "lg:hidden h-8 w-8 rounded-xl border-border/50",
                      activeFilter !== "all" &&
                        "border-primary/40 text-primary bg-primary/5",
                    )}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="px-5 py-4 border-b border-border/50">
                    <SheetTitle className="text-sm font-black">
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full">
                    <SidebarContent
                      categories={categories}
                      categoryCounts={categoryCounts}
                      activeFilter={activeFilter}
                      setActiveFilter={setActiveFilter}
                      topCommunities={topCommunities}
                      navigate={navigate}
                      onClose={() => setMobileFilterOpen(false)}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs font-semibold rounded-xl border-border/50 hidden sm:flex"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span className="hidden md:inline">
                      {currentSort?.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 pb-1">
                    Sort by
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="opacity-40" />
                  {SORT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className="rounded-lg text-xs gap-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "w-3 h-3 shrink-0 transition-opacity",
                          sortBy === opt.value
                            ? "opacity-100 text-primary"
                            : "opacity-0",
                        )}
                      />
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View toggle */}
              <div className="flex items-center bg-muted/50 p-0.5 rounded-xl border border-border/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        viewMode === "grid"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Grid view</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        viewMode === "list"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>List view</TooltipContent>
                </Tooltip>
              </div>

              {/* Create */}
              <CreateCommunityModal>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-xl font-bold shadow-sm text-xs"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </CreateCommunityModal>
            </div>
          </div>

          {/* Active filter chip */}
          <AnimatePresence>
            {activeFilter !== "all" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pt-2.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    Filtered by:
                  </span>
                  <Badge
                    variant="secondary"
                    className="gap-1.5 pr-1 font-semibold text-xs rounded-lg cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setActiveFilter("all")}
                  >
                    <Hash className="w-3 h-3" />
                    {activeFilter}
                    <X className="w-2.5 h-2.5 ml-0.5" />
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* ══════════════════════════════════════
            BODY
        ══════════════════════════════════════ */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:flex flex-col w-56 border-r border-border/40 bg-muted/10 overflow-hidden shrink-0">
            <ScrollArea className="h-full">
              <SidebarContent
                categories={categories}
                categoryCounts={categoryCounts}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                topCommunities={topCommunities}
                navigate={navigate}
              />
            </ScrollArea>
          </aside>

          {/* ── Main Feed ── */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Results bar */}
            <div className="px-5 py-2 border-b border-border/30 bg-background flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-3 w-28" />
                ) : (
                  <>
                    <span className="font-bold text-foreground tabular-nums">
                      {filtered.length}
                    </span>{" "}
                    {filtered.length === 1 ? "community" : "communities"}
                    {query && (
                      <span className="text-muted-foreground/60">
                        {" "}
                        matching "{query}"
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>

            <ScrollArea className="flex-1 h-full">
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {/* Loading */}
                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "gap-3",
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                          : "flex flex-col",
                      )}
                    >
                      {Array.from({ length: 8 }).map((_, i) =>
                        viewMode === "grid" ? (
                          <GridSkeleton key={i} />
                        ) : (
                          <ListSkeleton key={i} />
                        ),
                      )}
                    </motion.div>
                  )}

                  {/* Results */}
                  {!isLoading && filtered.length > 0 && (
                    <motion.div
                      key={`${viewMode}-${activeFilter}-${sortBy}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "gap-3",
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                          : "flex flex-col",
                      )}
                    >
                      {filtered.map((community, i) =>
                        viewMode === "grid" ? (
                          <CommunityGridCard
                            key={community._id}
                            community={community}
                            index={i}
                            onClick={() =>
                              navigate(`/communities/${community.name}`)
                            }
                          />
                        ) : (
                          <CommunityListRow
                            key={community._id}
                            community={community}
                            index={i}
                            onClick={() =>
                              navigate(`/communities/${community.name}`)
                            }
                          />
                        ),
                      )}
                    </motion.div>
                  )}

                  {/* Empty */}
                  {!isLoading && filtered.length === 0 && (
                    <EmptyState query={query} onClear={clearFilters} />
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Communities;
