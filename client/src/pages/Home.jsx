import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useGetPostsQuery } from "../app/api/postsApi";
import { useSelector } from "react-redux";
import {
  Loader2,
  TrendingUp,
  Flame,
  Sparkles,
  Clock,
  PenSquare,
  Hash,
  Globe,
  Users,
  Zap,
  ChevronRight,
  BarChart2,
  Radio,
  Search,
  X,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  ArrowUp,
  Bell,
  BellOff,
  CheckCheck,
  Rss,
  ChevronDown,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreatePostModal } from "../components/modals/CreatePostModal";
import PostCard from "../components/PostCard";
import { cn, getAvatarUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const SORT_TABS = [
  { id: "hot", label: "Hot", Icon: Flame, desc: "Most popular right now" },
  { id: "new", label: "New", Icon: Sparkles, desc: "Latest posts first" },
  { id: "top", label: "Top", Icon: BarChart2, desc: "Highest voted" },
  { id: "rise", label: "Rising", Icon: TrendingUp, desc: "Gaining momentum" },
];

const TRENDING = [
  { tag: "webdev", posts: "2.4k", delta: "+12%" },
  { tag: "technology", posts: "1.8k", delta: "+8%" },
  { tag: "design", posts: "940", delta: "+21%" },
  { tag: "science", posts: "720", delta: "+5%" },
  { tag: "gaming", posts: "610", delta: "+15%" },
];

const TIME_FILTERS = ["All time", "Today", "This week", "This month"];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmt = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

const useLocalStorage = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v) => {
      setVal(v);
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
    },
    [key],
  );
  return [val, set];
};

/* ─────────────────────────────────────────
   Post Skeleton
───────────────────────────────────────── */
const PostSkeleton = ({ compact }) => (
  <div
    className={cn(
      "bg-card/60 border border-border/20 rounded-2xl animate-pulse",
      compact ? "p-3 space-y-2" : "p-4 space-y-3",
    )}
  >
    <div className="flex items-center gap-2.5">
      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
      <Skeleton className="h-2.5 w-36 rounded-full" />
      <Skeleton className="h-2.5 w-16 rounded-full ml-auto" />
    </div>
    <Skeleton
      className={cn("rounded-lg", compact ? "h-4 w-3/5" : "h-5 w-3/4")}
    />
    {!compact && <Skeleton className="h-3.5 w-full rounded-lg" />}
    {!compact && <Skeleton className="h-3.5 w-2/3 rounded-lg" />}
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-7 w-14 rounded-xl" />
      <Skeleton className="h-7 w-14 rounded-xl" />
      <Skeleton className="h-7 w-14 rounded-xl" />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Inline Search Bar (feed filter)
───────────────────────────────────────── */
const FeedSearch = ({ value, onChange, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    setTimeout(() => ref.current?.focus(), 40);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2.5 bg-card/60 border border-border/25 rounded-xl px-3.5 py-2.5 mb-3">
        <Search className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter posts in feed…"
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/35 text-foreground"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground/50" />
          </button>
        )}
        <button
          onClick={onClose}
          className="text-[10px] font-bold text-muted-foreground/30 hover:text-muted-foreground transition-colors ml-1"
        >
          ESC
        </button>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   Read-progress bar (top of viewport)
───────────────────────────────────────── */
const ReadProgress = ({ scrollRef }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setPct(Math.min(100, (scrollTop / (scrollHeight - clientHeight)) * 100));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-border/10 z-10">
      <motion.div
        className="h-full bg-foreground/30 rounded-full"
        style={{ width: `${pct}%` }}
        transition={{ duration: 0.05 }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────
   Back-to-top FAB
───────────────────────────────────────── */
const BackToTop = ({ scrollRef }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;
    const onScroll = () => setShow(el.scrollTop > 600);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 8 }}
          transition={{ duration: 0.18 }}
          onClick={() =>
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-6 right-6 z-50 w-9 h-9 rounded-xl bg-foreground text-background shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* ─────────────────────────────────────────
   Compact Stat row for sidebar
───────────────────────────────────────── */
const StatRow = ({ icon: Icon, label, value, color, pulse }) => (
  <div className="flex items-center justify-between py-0.5">
    <div className="flex items-center gap-2 text-[12px] text-muted-foreground/60">
      <Icon className={cn("w-3 h-3", color)} strokeWidth={2} />
      {label}
    </div>
    <div
      className={cn(
        "flex items-center gap-1.5 text-[11px] font-black tabular-nums",
        color,
      )}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      )}
      {value}
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Notification Bell with badge
───────────────────────────────────────── */
const NotifBell = () => {
  const [muted, setMuted] = useState(false);
  const [count] = useState(3);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => {
            setMuted((m) => !m);
            toast.success(muted ? "Notifications on" : "Notifications muted");
          }}
          className="relative w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/50 hover:text-foreground"
        >
          {muted ? (
            <BellOff className="w-3.5 h-3.5" />
          ) : (
            <Bell className="w-3.5 h-3.5" />
          )}
          {!muted && count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-foreground text-background text-[8px] font-black flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {muted ? "Unmute notifications" : "Mute notifications"}
      </TooltipContent>
    </Tooltip>
  );
};

/* ─────────────────────────────────────────
   Feed toolbar
───────────────────────────────────────── */
const FeedToolbar = ({
  sort,
  setSort,
  searchOpen,
  setSearchOpen,
  compact,
  setCompact,
  timeFilter,
  setTimeFilter,
  readPosts,
  onMarkAllRead,
  postCount,
}) => (
  <div className="flex items-center gap-1.5">
    {/* Sort tabs */}
    <div className="flex items-center bg-card/60 border border-border/20 rounded-xl p-0.5 gap-0 flex-1 sm:flex-none">
      {SORT_TABS.map(({ id, label, Icon, desc }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSort(id)}
              className={cn(
                "flex items-center gap-1.5 flex-1 sm:flex-none justify-center sm:justify-start px-2.5 py-1.5 rounded-[10px] text-[11.5px] font-bold transition-all duration-150",
                sort === id
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40",
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {desc}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>

    {/* Time filter */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-border/20 bg-card/60 text-[11px] font-bold text-muted-foreground/60 hover:text-foreground hover:border-border/40 transition-all">
          <Clock className="w-3 h-3" />
          {timeFilter}
          <ChevronDown className="w-2.5 h-2.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xl border-border/20 bg-card/95 backdrop-blur-xl min-w-[130px]"
      >
        {TIME_FILTERS.map((t) => (
          <DropdownMenuItem
            key={t}
            onClick={() => setTimeFilter(t)}
            className={cn(
              "text-[12px] font-medium rounded-lg mx-1 my-0.5 cursor-pointer",
              t === timeFilter && "font-bold text-foreground bg-muted/40",
            )}
          >
            {t === timeFilter && (
              <CheckCheck className="w-3 h-3 mr-1.5 opacity-60" />
            )}
            {t}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Right controls */}
    <div className="flex items-center gap-0.5 ml-auto">
      {readPosts.size > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMarkAllRead}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/40 hover:text-foreground"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Clear read history
          </TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              searchOpen
                ? "bg-foreground text-background"
                : "hover:bg-muted/60 text-muted-foreground/40 hover:text-foreground",
            )}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Filter feed
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setCompact((c) => !c)}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              compact
                ? "bg-foreground text-background"
                : "hover:bg-muted/60 text-muted-foreground/40 hover:text-foreground",
            )}
          >
            {compact ? (
              <LayoutList className="w-3.5 h-3.5" />
            ) : (
              <LayoutGrid className="w-3.5 h-3.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {compact ? "Expanded view" : "Compact view"}
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
);

/* ─────────────────────────────────────────
   Trending tag row
───────────────────────────────────────── */
const TrendingRow = ({ tag, posts, delta, rank, onClick }) => (
  <motion.button
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: rank * 0.05 }}
    onClick={onClick}
    className="group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-muted/30 transition-all active:scale-[0.99]"
  >
    <span className="text-[9px] font-black text-muted-foreground/20 w-3.5 text-right tabular-nums shrink-0">
      {rank}
    </span>
    <div className="text-left flex-1 min-w-0">
      <p className="text-[12.5px] font-bold text-foreground/80 group-hover:text-foreground truncate">
        #{tag}
      </p>
      <p className="text-[10px] text-muted-foreground/40 font-medium">
        {posts} posts
      </p>
    </div>
    <span className="text-[9px] font-black text-emerald-500/80 shrink-0">
      {delta}
    </span>
    <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
  </motion.button>
);

/* ─────────────────────────────────────────
   Sidebar panel wrapper
───────────────────────────────────────── */
const Panel = ({ children, className }) => (
  <div
    className={cn(
      "bg-card/60 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden",
      className,
    )}
  >
    {children}
  </div>
);

const PanelHeader = ({ icon: Icon, label, action, onAction }) => (
  <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3 h-3 text-muted-foreground/30" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/35">
        {label}
      </span>
    </div>
    {action && (
      <button
        onClick={onAction}
        className="text-[10px] text-muted-foreground/30 hover:text-foreground transition-colors font-bold flex items-center gap-0.5"
      >
        {action} <ChevronRight className="w-2.5 h-2.5" />
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────
   Saved-posts mini list
───────────────────────────────────────── */
const SavedSection = ({ savedIds, posts = [], navigate }) => {
  const savedPosts = posts.filter((p) => savedIds.has(p._id)).slice(0, 3);
  if (!savedPosts.length) return null;

  return (
    <Panel>
      <PanelHeader
        icon={Bookmark}
        label="Saved"
        action="See all"
        onAction={() => {}}
      />
      <div className="px-2 pb-2 space-y-0.5">
        {savedPosts.map((p) => (
          <button
            key={p._id}
            onClick={() => navigate(`/post/${p._id}`)}
            className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-muted/30 transition-colors group"
          >
            <p className="text-[12px] font-semibold text-foreground/75 group-hover:text-foreground line-clamp-1 transition-colors">
              {p.title}
            </p>
            <p className="text-[10px] text-muted-foreground/35 mt-0.5">
              c/{p.community?.name}
            </p>
          </button>
        ))}
      </div>
    </Panel>
  );
};

/* ─────────────────────────────────────────
   Quick-compose bar
───────────────────────────────────────── */
const QuickCompose = ({ userInfo }) => {
  if (!userInfo) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-2.5 bg-card/60 border border-border/20 rounded-2xl px-3.5 py-2.5 shadow-sm backdrop-blur-sm"
    >
      <div className="w-7 h-7 rounded-lg overflow-hidden border border-border/25 bg-muted shrink-0">
        <img
          src={getAvatarUrl(userInfo)}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>
      <CreatePostModal>
        <button className="flex-1 text-left h-8 px-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/20 hover:border-border/40 text-[12.5px] text-muted-foreground/40 font-medium transition-all cursor-text">
          What's on your mind?
        </button>
      </CreatePostModal>
      <CreatePostModal>
        <Button
          size="sm"
          className="h-8 px-3 rounded-xl text-[12px] font-bold shrink-0 gap-1.5 bg-foreground text-background hover:opacity-90 active:scale-[0.97]"
        >
          <PenSquare className="w-3 h-3" />
          <span className="hidden sm:inline">Post</span>
        </Button>
      </CreatePostModal>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════
   Home Page
═══════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);

  /* ── Feed state ── */
  const [sort, setSort] = useState("hot");
  const [timeFilter, setTimeFilter] = useState("All time");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [compact, setCompact] = useLocalStorage("feed-compact", false);
  const [hideRead, setHideRead] = useLocalStorage("hide-read", false);
  const [readPosts, setReadPosts] = useLocalStorage("read-posts-set", []);
  const [savedIds, setSavedIds] = useLocalStorage("saved-posts", []);

  /* convert arrays back to Sets after hydration */
  const readSet = useMemo(() => new Set(readPosts), [readPosts]);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const scrollRef = useRef(null);

  /* ── Data ── */
  const { data: posts, isLoading, isError, refetch } = useGetPostsQuery();

  /* ── Keyboard shortcut: / opens feed search ── */
  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQ("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Derived: sort + filter ── */
  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    let arr = [...posts];

    /* Time filter */
    if (timeFilter !== "All time") {
      const now = Date.now();
      const cutoff =
        timeFilter === "Today"
          ? 86_400_000
          : timeFilter === "This week"
            ? 604_800_000
            : 2_592_000_000; /* month */
      arr = arr.filter((p) => now - new Date(p.createdAt).getTime() < cutoff);
    }

    /* Sort */
    if (sort === "new")
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "top")
      arr.sort((a, b) => (b.upvotes?.length ?? 0) - (a.upvotes?.length ?? 0));
    if (sort === "rise")
      arr.sort((a, b) => (b.commentCount ?? 0) - (a.commentCount ?? 0));

    /* Search filter */
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.content?.toLowerCase().includes(q),
      );
    }

    /* Hide read */
    if (hideRead) arr = arr.filter((p) => !readSet.has(p._id));

    return arr;
  }, [posts, sort, timeFilter, searchQ, hideRead, readSet]);

  /* ── Mark post as read on click ── */
  const markRead = useCallback(
    (id) => {
      if (!readSet.has(id)) setReadPosts([...readPosts, id]);
    },
    [readSet, readPosts, setReadPosts],
  );

  /* ── Toggle save ── */
  const toggleSave = useCallback(
    (id) => {
      const next = savedSet.has(id)
        ? savedIds.filter((x) => x !== id)
        : [...savedIds, id];
      setSavedIds(next);
      toast.success(savedSet.has(id) ? "Removed from saved" : "Post saved!");
    },
    [savedSet, savedIds, setSavedIds],
  );

  /* ── Stats ── */
  const readCount = readSet.size;
  const savedCount = savedSet.size;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full w-full flex justify-center overflow-hidden">
        <div className="max-w-[1480px] w-full flex gap-8 xl:gap-10 px-4 sm:px-6 md:px-8 py-5 h-full">
          {/* ════════ MAIN FEED ════════ */}
          <main
            ref={scrollRef}
            className="relative flex-1 min-w-0 overflow-y-auto scroll-smooth space-y-3 pb-24"
            style={{ scrollbarWidth: "none" }}
          >
            <ReadProgress scrollRef={scrollRef} />

            {/* Quick compose */}
            <QuickCompose userInfo={userInfo} />

            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              <FeedToolbar
                sort={sort}
                setSort={setSort}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
                compact={compact}
                setCompact={setCompact}
                timeFilter={timeFilter}
                setTimeFilter={setTimeFilter}
                readPosts={readSet}
                onMarkAllRead={() => {
                  setReadPosts([]);
                  toast.success("Read history cleared");
                }}
                postCount={sortedPosts.length}
              />
            </motion.div>

            {/* Inline search */}
            <AnimatePresence>
              {searchOpen && (
                <FeedSearch
                  value={searchQ}
                  onChange={setSearchQ}
                  onClose={() => {
                    setSearchOpen(false);
                    setSearchQ("");
                  }}
                />
              )}
            </AnimatePresence>

            {/* Feed meta bar */}
            {!isLoading && !isError && (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground/40 px-0.5">
                <span className="font-medium">
                  {sortedPosts.length === 0
                    ? "No posts"
                    : `${sortedPosts.length} post${sortedPosts.length !== 1 ? "s" : ""}`}
                  {searchQ && ` matching "${searchQ}"`}
                </span>
                <button
                  onClick={() => setHideRead((h) => !h)}
                  className={cn(
                    "flex items-center gap-1.5 font-bold transition-colors",
                    hideRead
                      ? "text-foreground/60"
                      : "hover:text-foreground/60",
                  )}
                >
                  {hideRead ? (
                    <>
                      <Eye className="w-3 h-3" /> Show read
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide read ({readCount})
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── Loading ── */}
            {isLoading && (
              <div className={cn("space-y-2.5")}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <PostSkeleton key={i} compact={compact} />
                ))}
              </div>
            )}

            {/* ── Error ── */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-14 bg-card/60 border border-destructive/15 rounded-2xl text-center px-6"
              >
                <div className="w-10 h-10 rounded-2xl bg-destructive/8 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-destructive/50" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-foreground/70">
                    Couldn't load feed
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                    Check your connection and try again.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl text-[12px] font-bold gap-1.5 border-border/30"
                  onClick={refetch}
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </Button>
              </motion.div>
            )}

            {/* ── Empty ── */}
            {!isLoading && !isError && sortedPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-16 bg-card/60 border border-dashed border-border/25 rounded-2xl text-center px-6"
              >
                <Sparkles className="w-8 h-8 text-muted-foreground/15" />
                <div>
                  <p className="text-[13px] font-bold text-foreground/60">
                    {searchQ
                      ? `No results for "${searchQ}"`
                      : "Nothing here yet"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                    {searchQ
                      ? "Try a different search or clear filters."
                      : "Be the first to start a discussion!"}
                  </p>
                </div>
                {searchQ ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-xl text-[12px] font-bold border-border/30"
                    onClick={() => {
                      setSearchQ("");
                      setSearchOpen(false);
                    }}
                  >
                    <X className="w-3 h-3 mr-1.5" /> Clear search
                  </Button>
                ) : (
                  <CreatePostModal>
                    <Button
                      size="sm"
                      className="h-8 rounded-xl text-[12px] font-bold gap-1.5"
                    >
                      <PenSquare className="w-3 h-3" /> Create Post
                    </Button>
                  </CreatePostModal>
                )}
              </motion.div>
            )}

            {/* ── Posts ── */}
            {!isLoading && !isError && sortedPosts.length > 0 && (
              <AnimatePresence mode="popLayout">
                <div className={cn("space-y-2.5")}>
                  {sortedPosts.map((post, i) => (
                    <motion.div
                      key={post._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        delay: Math.min(i * 0.04, 0.3),
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() => markRead(post._id)}
                      className={cn(
                        "transition-opacity duration-300",
                        readSet.has(post._id) && "opacity-60 hover:opacity-100",
                      )}
                    >
                      <PostCard post={post} compact={compact} />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            {/* ── End of feed ── */}
            {!isLoading && sortedPosts.length > 5 && (
              <div className="flex items-center gap-3 py-6">
                <div className="flex-1 h-px bg-border/15" />
                <span className="text-[10px] text-muted-foreground/25 font-bold uppercase tracking-widest">
                  You're all caught up
                </span>
                <div className="flex-1 h-px bg-border/15" />
              </div>
            )}
          </main>

          {/* ════════ SIDEBAR ════════ */}
          <aside
            className="hidden lg:flex flex-col gap-3 w-[248px] xl:w-[264px] shrink-0 h-full overflow-y-auto pb-10"
            style={{ scrollbarWidth: "none" }}
          >
            {/* ── Create panel ── */}
            <Panel>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-foreground flex items-center justify-center">
                      <Rss className="w-2.5 h-2.5 text-background" />
                    </div>
                    <span className="text-[12px] font-black tracking-tight uppercase text-foreground">
                      Discussly
                    </span>
                  </div>
                  <NotifBell />
                </div>
                <p className="text-[11.5px] text-muted-foreground/60 leading-relaxed">
                  Your home for discussions, communities, and ideas that matter.
                </p>
                <Separator className="bg-border/15" />
                <div className="space-y-1.5">
                  <CreatePostModal>
                    <Button
                      size="sm"
                      className="w-full h-8 rounded-xl text-[12px] font-bold gap-1.5 bg-foreground text-background hover:opacity-90 active:scale-[0.97]"
                    >
                      <PenSquare className="w-3 h-3" />
                      Create Post
                    </Button>
                  </CreatePostModal>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 rounded-xl text-[12px] font-bold gap-1.5 border-border/25 hover:bg-muted/40 active:scale-[0.97]"
                    onClick={() => navigate("/communities/create")}
                  >
                    <Hash className="w-3 h-3" />
                    Create Community
                  </Button>
                </div>
              </div>
            </Panel>

            {/* ── Your activity ── */}
            {userInfo && (
              <Panel>
                <PanelHeader icon={BarChart2} label="Your Activity" />
                <div className="px-4 pb-3.5 space-y-2.5">
                  <StatRow
                    icon={Eye}
                    label="Posts read"
                    value={readCount}
                    color="text-sky-500"
                  />
                  <StatRow
                    icon={Bookmark}
                    label="Saved posts"
                    value={savedCount}
                    color="text-amber-500"
                  />
                  <StatRow
                    icon={Zap}
                    label="Posts today"
                    value={fmt(posts?.length ?? 0)}
                    color="text-orange-500"
                  />
                </div>
              </Panel>
            )}

            {/* ── Saved posts ── */}
            {savedSet.size > 0 && (
              <SavedSection
                savedIds={savedSet}
                posts={posts || []}
                navigate={navigate}
              />
            )}

            {/* ── Trending ── */}
            <Panel>
              <PanelHeader
                icon={Flame}
                label="Trending"
                action="Explore"
                onAction={() => navigate("/explore")}
              />
              <div className="px-2 pb-2 space-y-0">
                {TRENDING.map(({ tag, posts: count, delta }, i) => (
                  <TrendingRow
                    key={tag}
                    tag={tag}
                    posts={count}
                    delta={delta}
                    rank={i + 1}
                    onClick={() => navigate(`/explore?tag=${tag}`)}
                  />
                ))}
              </div>
            </Panel>

            {/* ── Community stats ── */}
            <Panel>
              <PanelHeader icon={Globe} label="Community" />
              <div className="px-4 pb-4 space-y-2.5">
                <StatRow
                  icon={Users}
                  label="Members online"
                  value="1,024"
                  color="text-emerald-500"
                  pulse
                />
                <StatRow
                  icon={Globe}
                  label="Active communities"
                  value="342"
                  color="text-sky-400"
                />
                <StatRow
                  icon={Zap}
                  label="Posts today"
                  value={fmt(posts?.length ?? 0)}
                  color="text-orange-400"
                />
                <Separator className="bg-border/10 mt-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 rounded-xl text-[11px] font-bold text-muted-foreground/40 hover:text-foreground hover:bg-muted/30 gap-1.5"
                  onClick={() => navigate("/explore")}
                >
                  <Globe className="w-3 h-3" />
                  Browse communities
                </Button>
              </div>
            </Panel>

            {/* ── Footer ── */}
            <div className="px-1 pt-1 flex flex-wrap gap-x-3 gap-y-1">
              {["Help", "About", "Terms", "Privacy", "Rules"].map((l) => (
                <button
                  key={l}
                  className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors font-medium"
                >
                  {l}
                </button>
              ))}
              <span className="text-[10px] text-muted-foreground/20 w-full mt-0.5">
                © {new Date().getFullYear()} Discussly
              </span>
            </div>
          </aside>
        </div>

        {/* Back to top */}
        <BackToTop scrollRef={scrollRef} />
      </div>
    </TooltipProvider>
  );
};

export default Home;
