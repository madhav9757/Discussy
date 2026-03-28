import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Trophy,
  Flame,
  ArrowUpRight,
  MessageSquare,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Users,
  Clock,
  Hash,
  Star,
  Activity,
  Search,
  X,
  Eye,
  Bookmark,
  Share2,
  ThumbsUp,
  Zap,
  Globe,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  useGetTrendingPostsQuery,
  useGetPopularCommunitiesQuery,
  useGetNewCommunitiesQuery,
  useGetTopCreatorsQuery,
  useGetCommunityCategoriesQuery,
} from "../app/api/exploreApi";

import PostCard from "../components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn, getAvatarUrl, getCommunityIconUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const fmt = (n = 0) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

/* ─────────────────────────────────────────
   Skeleton atom
───────────────────────────────────────── */
const Sk = ({ className }) => (
  <Skeleton className={cn("bg-muted/40 rounded-lg", className)} />
);

/* ─────────────────────────────────────────
   Live Ticker
───────────────────────────────────────── */
const LiveTicker = ({ posts = [], communities = [] }) => {
  const items = [
    ...posts.slice(0, 3).map((p) => ({
      icon: <Flame className="w-3 h-3 text-amber-500 shrink-0" />,
      text: `"${p.title?.slice(0, 40)}…" is trending`,
    })),
    ...communities.slice(0, 3).map((c) => ({
      icon: <Users className="w-3 h-3 text-sky-500 shrink-0" />,
      text: `c/${c.name} gaining momentum · ${fmt(c.memberCount)} members`,
    })),
  ];
  if (!items.length) return null;

  return (
    <div className="border-b border-border/20 bg-muted/10 h-8 flex items-center overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-4 border-r border-border/20 h-full bg-background/60 backdrop-blur-sm z-10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          Live
        </span>
      </div>
      <div className="flex animate-marquee whitespace-nowrap gap-0">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-8 text-[11px] text-muted-foreground/60"
          >
            {item.icon}
            {item.text}
            <span className="text-border/40 mx-2">·</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Trending Carousel (hero)
───────────────────────────────────────── */
const TrendingCarousel = ({ posts = [], loading, navigate }) => {
  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    if (posts.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % posts.length), 6000);
    return () => clearInterval(t);
  }, [posts.length]);

  const prev = () => setIdx((i) => (i - 1 + posts.length) % posts.length);
  const next = () => setIdx((i) => (i + 1) % posts.length);

  if (loading)
    return (
      <div className="rounded-2xl border border-border/20 bg-card/60 p-5 space-y-4 h-[180px]">
        <div className="flex items-center gap-2">
          <Sk className="h-3 w-3 rounded-full" />
          <Sk className="h-2.5 w-16" />
        </div>
        <Sk className="h-5 w-3/4" />
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-2/3" />
        <div className="flex gap-4 pt-1">
          <Sk className="h-2.5 w-14" />
          <Sk className="h-2.5 w-10" />
        </div>
      </div>
    );

  const post = posts[idx];
  if (!post) return null;

  return (
    <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm overflow-hidden group">
      {/* Top strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10 bg-muted/20">
        <div className="flex items-center gap-2">
          <Flame className="w-3 h-3 text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Trending Now
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {posts.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === idx
                    ? "bg-foreground w-5"
                    : "bg-border/40 w-1.5 hover:bg-border",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={prev}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/50 hover:text-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={next}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground/50 hover:text-foreground"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={post._id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 cursor-pointer"
          onClick={() => navigate(`/post/${post._id}`)}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-[14px] font-bold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors flex-1">
              {post.title}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSaved((s) => ({ ...s, [post._id]: !s[post._id] }));
              }}
              className="shrink-0 mt-0.5 p-1 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <Bookmark
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  saved[post._id]
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground/40 hover:text-foreground",
                )}
              />
            </button>
          </div>

          <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed mb-3">
            {post.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5 rounded-full border border-border/20">
                <AvatarImage src={getAvatarUrl(post.author)} />
                <AvatarFallback className="text-[8px] font-bold">
                  {post.author?.username?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground/60">
                u/{post.author?.username}
                <span className="text-border/50 mx-1.5">·</span>
                c/{post.community?.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {fmt(post.voteScore)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {fmt(post.commentCount)}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────
   Poll Widget
───────────────────────────────────────── */
const PollWidget = () => {
  const [voted, setVoted] = useState(null);
  const [votes, setVotes] = useState({ 0: 412, 1: 287, 2: 198 });
  const options = ["Critical Thinking", "AI Collaboration", "Craftsmanship"];
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...Object.values(votes));

  const vote = (i) => {
    if (voted !== null) return;
    setVotes((v) => ({ ...v, [i]: v[i] + 1 }));
    setVoted(i);
  };

  return (
    <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Poll · Today
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-medium">
          {fmt(total)} votes
        </span>
      </div>

      <p className="text-[13px] font-bold leading-snug text-foreground">
        Most important design skill in 2026?
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const pct = Math.round((votes[i] / total) * 100);
          const isWinner = voted !== null && votes[i] === maxVotes;
          const isVoted = voted === i;
          return (
            <button
              key={opt}
              onClick={() => vote(i)}
              disabled={voted !== null}
              className={cn(
                "w-full text-left rounded-xl overflow-hidden relative transition-all duration-200",
                voted === null
                  ? "border border-border/30 hover:border-border/60 hover:bg-muted/20 active:scale-[0.99]"
                  : "border border-border/20 cursor-default",
              )}
            >
              {voted !== null && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "absolute inset-0 h-full rounded-xl",
                    isVoted
                      ? "bg-foreground/8"
                      : isWinner
                        ? "bg-amber-500/8"
                        : "bg-muted/30",
                  )}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span
                  className={cn(
                    "text-[12px] font-medium flex items-center gap-1.5",
                    isWinner && voted !== null
                      ? "text-foreground font-bold"
                      : voted !== null
                        ? "text-muted-foreground"
                        : "text-foreground/80",
                  )}
                >
                  {opt}
                  {isWinner && voted !== null && (
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  )}
                </span>
                {voted !== null && (
                  <span
                    className={cn(
                      "text-[11px] font-black tabular-nums",
                      isWinner ? "text-amber-500" : "text-muted-foreground/50",
                    )}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Creator Row
───────────────────────────────────────── */
const CreatorRow = ({ creator, rank, navigate }) => {
  const rankColors = {
    1: "text-amber-500",
    2: "text-zinc-400",
    3: "text-orange-600",
  };

  return (
    <button
      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-all group active:scale-[0.99]"
      onClick={() => navigate(`/profile/${creator.user?.username}`)}
    >
      <span
        className={cn(
          "text-[10px] font-black w-5 text-right shrink-0 tabular-nums",
          rankColors[rank] || "text-muted-foreground/25",
        )}
      >
        {rank <= 3 ? rank : `#${rank}`}
      </span>
      <Avatar className="w-6 h-6 shrink-0 rounded-full border border-border/20">
        <AvatarImage src={getAvatarUrl(creator.user)} />
        <AvatarFallback className="text-[9px] font-bold">
          {creator.user?.username?.charAt(0)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-[12px] font-semibold flex-1 text-left truncate group-hover:text-primary transition-colors">
        u/{creator.user?.username}
      </span>
      <span className="text-[10px] text-muted-foreground/40 shrink-0 tabular-nums">
        {fmt(creator.postCount)} posts
      </span>
    </button>
  );
};

/* ─────────────────────────────────────────
   Community Card
───────────────────────────────────────── */
const badgeStyles = {
  hot: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  new: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  rising: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const CommunityCard = ({ comm, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl border border-border/20 hover:border-border/40 hover:bg-muted/20 transition-all group active:scale-[0.99]"
  >
    <Avatar className="w-8 h-8 shrink-0 rounded-xl border border-border/20">
      <AvatarImage src={getCommunityIconUrl(comm)} />
      <AvatarFallback className="text-[11px] font-black rounded-xl bg-gradient-to-br from-muted to-muted/50">
        {comm.name?.charAt(0)?.toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0 text-left">
      <p className="text-[12px] font-bold truncate group-hover:text-primary transition-colors">
        c/{comm.name}
      </p>
      <p className="text-[10px] text-muted-foreground/50 tabular-nums">
        {fmt(comm.memberCount)} members
      </p>
    </div>
    {badge && (
      <span
        className={cn(
          "text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-lg border shrink-0",
          badgeStyles[badge] || badgeStyles.rising,
        )}
      >
        {badge}
      </span>
    )}
    <ChevronRight className="w-3 h-3 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
  </button>
);

/* ─────────────────────────────────────────
   Section Header
───────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, label, action, onAction }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
        {label}
      </span>
    </div>
    {action && (
      <button
        onClick={onAction}
        className="text-[10px] text-muted-foreground/40 hover:text-foreground transition-colors flex items-center gap-0.5 font-medium"
      >
        {action}
        <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

/* ─────────────────────────────────────────
   Search Overlay
───────────────────────────────────────── */
const SearchOverlay = ({
  open,
  onClose,
  posts = [],
  communities = [],
  navigate,
}) => {
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [open]);

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(q.toLowerCase()),
  );
  const filteredComms = communities.filter((c) =>
    c.name?.toLowerCase().includes(q.toLowerCase()),
  );

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -12, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[560px] bg-card/95 border border-border/30 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/20">
          <Search className="w-4 h-4 text-muted-foreground/50 shrink-0" />
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, communities…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/35 text-foreground"
          />
          {q ? (
            <button
              onClick={() => setQ("")}
              className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          ) : (
            <kbd className="text-[9px] font-bold bg-muted/60 border border-border/30 text-muted-foreground/50 px-1.5 py-0.5 rounded-md">
              ESC
            </kbd>
          )}
        </div>

        {/* Results */}
        {q.length > 0 ? (
          <div className="max-h-[360px] overflow-y-auto">
            {filteredComms.length > 0 && (
              <div className="px-2 pt-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 px-2 mb-1.5">
                  Communities
                </p>
                {filteredComms.slice(0, 3).map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      navigate(`/communities/${c.name}`);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors text-left"
                  >
                    <Avatar className="w-6 h-6 rounded-lg border border-border/20">
                      <AvatarImage src={getCommunityIconUrl(c)} />
                      <AvatarFallback className="text-[9px] font-bold rounded-lg">
                        {c.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[13px] font-semibold flex-1 truncate">
                      c/{c.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {fmt(c.memberCount)} members
                    </span>
                  </button>
                ))}
              </div>
            )}
            {filteredPosts.length > 0 && (
              <div className="px-2 pt-2 pb-2">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 px-2 mb-1.5">
                  Posts
                </p>
                {filteredPosts.slice(0, 5).map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/post/${p._id}`);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors text-left"
                  >
                    <Hash className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                    <span className="text-[13px] flex-1 line-clamp-1 font-medium">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 shrink-0">
                      {fmt(p.voteScore)} votes
                    </span>
                  </button>
                ))}
              </div>
            )}
            {filteredPosts.length === 0 && filteredComms.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[13px] text-muted-foreground/50">
                  No results for "{q}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 text-[11px] text-muted-foreground/40">
            Type to search across Discussly
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────
   Sidebar Panel wrapper
───────────────────────────────────────── */
const SidePanel = ({ children, className }) => (
  <div
    className={cn(
      "rounded-2xl border border-border/20 bg-card/60 backdrop-blur-sm overflow-hidden",
      className,
    )}
  >
    {children}
  </div>
);

/* ─────────────────────────────────────────
   Stats bar (communities / creators views)
───────────────────────────────────────── */
const StatBar = ({ stats }) => (
  <div className="flex items-center gap-6 pb-5 border-b border-border/10 mb-6">
    {stats.map(({ icon: Icon, value, label }) => (
      <div key={label} className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-sm font-black tabular-nums">{value}</span>
        <span className="text-[11px] text-muted-foreground/50">{label}</span>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   View Switcher Tab
───────────────────────────────────────── */
const VIEWS = [
  { key: "feed", label: "Feed", icon: Zap },
  { key: "communities", label: "Communities", icon: Globe },
  { key: "creators", label: "Creators", icon: Trophy },
];

/* ═══════════════════════════════════════
   Main Explore Page
═══════════════════════════════════════ */
const Explore = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState("feed");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: trendingPosts, isLoading: trendingLoading } =
    useGetTrendingPostsQuery(undefined, {
      refetchOnMountOrArgChange: refreshKey,
    });
  const { data: popularCommunities, isLoading: popularLoading } =
    useGetPopularCommunitiesQuery();
  const { data: newCommunities, isLoading: newCommLoading } =
    useGetNewCommunitiesQuery();
  const { data: topCreators, isLoading: creatorsLoading } =
    useGetTopCreatorsQuery();
  const { data: categoriesData } = useGetCommunityCategoriesQuery();

  const categories = ["All", ...(categoriesData?.map((c) => c.name) || [])];
  const top4Posts = trendingPosts?.slice(0, 4) || [];
  const feedPosts = trendingPosts
    ? activeCategory === "All"
      ? trendingPosts.slice(4)
      : trendingPosts.filter((p) => p.community?.category === activeCategory)
    : [];

  const allCommunities = [
    ...(popularCommunities || []),
    ...(newCommunities || []),
  ].filter((c, i, arr) => arr.findIndex((x) => x._id === c._id) === i);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden flex flex-col">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/80 backdrop-blur-2xl">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 h-[52px] flex items-center justify-between gap-4">
          {/* Left: title + view tabs */}
          <div className="flex items-center gap-5 min-w-0">
            <div className="shrink-0">
              <h1 className="text-sm font-black tracking-tight leading-none text-foreground">
                Discover
              </h1>
              <p className="text-[9px] text-muted-foreground/40 font-medium mt-0.5 uppercase tracking-widest">
                Discussly
              </p>
            </div>

            <div className="hidden sm:flex items-center rounded-xl border border-border/20 bg-muted/20 p-0.5 gap-0">
              {VIEWS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all duration-200",
                    view === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground/60 hover:text-foreground",
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: search + refresh */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-8 px-3 rounded-xl border border-border/20 bg-muted/10 text-[11px] text-muted-foreground/60 hover:text-foreground hover:border-border/40 hover:bg-muted/30 transition-all"
            >
              <Search className="w-3 h-3" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline text-[9px] bg-muted border border-border/20 px-1.5 py-0.5 rounded-md font-bold">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="w-8 h-8 rounded-xl border border-border/20 flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:border-border/40 hover:bg-muted/30 transition-all active:scale-90"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Live Ticker ── */}
      <LiveTicker
        posts={trendingPosts || []}
        communities={popularCommunities || []}
      />

      {/* ── Mobile View Tabs ── */}
      <div className="sm:hidden flex items-center gap-1 px-4 pt-3 pb-0">
        {VIEWS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex-1 justify-center border",
              view === key
                ? "bg-foreground text-background border-foreground"
                : "text-muted-foreground/60 border-border/20 hover:text-foreground",
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 py-5">
        <AnimatePresence mode="wait">
          {/* ═══ FEED VIEW ═══ */}
          {view === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start"
            >
              {/* ── Main Feed Column ── */}
              <div className="min-w-0 space-y-5">
                {/* Hero Carousel */}
                <TrendingCarousel
                  posts={top4Posts}
                  loading={trendingLoading}
                  navigate={navigate}
                />

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 border",
                        activeCategory === cat
                          ? "bg-foreground text-background border-foreground"
                          : "text-muted-foreground/60 border-border/20 hover:text-foreground hover:border-border/40 hover:bg-muted/20",
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Section label */}
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-muted-foreground/40" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    Deep Dive
                  </span>
                  {activeCategory !== "All" && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] font-black rounded-lg px-2 py-0.5 ml-1"
                    >
                      {activeCategory}
                    </Badge>
                  )}
                </div>

                {/* Post Feed using PostCard */}
                <div className="space-y-3">
                  {trendingLoading ? (
                    [...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border/20 bg-card/60 p-4 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <Sk className="w-5 h-5 rounded-full" />
                          <Sk className="h-2.5 w-28" />
                        </div>
                        <Sk className="h-5 w-4/5" />
                        <Sk className="h-4 w-full" />
                        <div className="flex gap-3 pt-1">
                          <Sk className="h-7 w-16 rounded-xl" />
                          <Sk className="h-7 w-16 rounded-xl" />
                        </div>
                      </div>
                    ))
                  ) : feedPosts.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                      {feedPosts.map((post, i) => (
                        <motion.div
                          key={post._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{
                            delay: i * 0.035,
                            duration: 0.25,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          <PostCard post={post} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/30 bg-muted/10 py-16 text-center">
                      <Sparkles className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-[13px] font-medium text-muted-foreground/50">
                        Nothing in{" "}
                        <span className="font-bold">{activeCategory}</span> yet.
                      </p>
                      <p className="text-[11px] text-muted-foreground/30 mt-1">
                        Check back soon or explore other categories.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Sidebar Column ── */}
              <aside className="space-y-4 lg:sticky lg:top-[68px] lg:self-start">
                {/* Poll */}
                <PollWidget />

                {/* Hot Communities */}
                <SidePanel>
                  <div className="px-4 pt-4 pb-2">
                    <SectionHeader
                      icon={TrendingUp}
                      label="Hot Communities"
                      action="See all"
                      onAction={() => setView("communities")}
                    />
                  </div>
                  <div className="px-2 pb-3 space-y-1">
                    {popularLoading
                      ? [...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2 p-2">
                            <Sk className="w-8 h-8 rounded-xl" />
                            <div className="flex-1 space-y-1.5">
                              <Sk className="h-3 w-24" />
                              <Sk className="h-2.5 w-14" />
                            </div>
                          </div>
                        ))
                      : popularCommunities
                          ?.slice(0, 5)
                          .map((comm, i) => (
                            <CommunityCard
                              key={comm._id}
                              comm={comm}
                              badge={
                                i === 0 ? "hot" : i < 2 ? "rising" : undefined
                              }
                              onClick={() =>
                                navigate(`/communities/${comm.name}`)
                              }
                            />
                          ))}
                  </div>
                </SidePanel>

                {/* New Arrivals */}
                <SidePanel>
                  <div className="px-4 pt-4 pb-2">
                    <SectionHeader icon={Clock} label="New Arrivals" />
                  </div>
                  <div className="px-2 pb-3 space-y-1">
                    {newCommLoading
                      ? [...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-2 p-2">
                            <Sk className="w-8 h-8 rounded-xl" />
                            <div className="flex-1 space-y-1.5">
                              <Sk className="h-3 w-20" />
                              <Sk className="h-2.5 w-12" />
                            </div>
                          </div>
                        ))
                      : newCommunities
                          ?.slice(0, 4)
                          .map((comm) => (
                            <CommunityCard
                              key={comm._id}
                              comm={comm}
                              badge="new"
                              onClick={() =>
                                navigate(`/communities/${comm.name}`)
                              }
                            />
                          ))}
                  </div>
                </SidePanel>

                {/* Top Voices */}
                <SidePanel>
                  <div className="px-4 pt-4 pb-2">
                    <SectionHeader
                      icon={Trophy}
                      label="Top Voices"
                      action="See all"
                      onAction={() => setView("creators")}
                    />
                  </div>
                  <div className="px-2 pb-3 space-y-0.5">
                    {creatorsLoading
                      ? [...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-2">
                            <Sk className="w-4 h-2.5 rounded" />
                            <Sk className="w-6 h-6 rounded-full" />
                            <Sk className="h-3 flex-1" />
                            <Sk className="h-2.5 w-12" />
                          </div>
                        ))
                      : topCreators
                          ?.slice(0, 5)
                          .map((creator, i) => (
                            <CreatorRow
                              key={creator.user?._id}
                              creator={creator}
                              rank={i + 1}
                              navigate={navigate}
                            />
                          ))}
                  </div>
                </SidePanel>
              </aside>
            </motion.div>
          )}

          {/* ═══ COMMUNITIES VIEW ═══ */}
          {view === "communities" && (
            <motion.div
              key="communities"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <StatBar
                stats={[
                  {
                    icon: Globe,
                    value: fmt(allCommunities.length),
                    label: "communities",
                  },
                  {
                    icon: Users,
                    value: fmt(
                      allCommunities.reduce(
                        (a, c) => a + (c.memberCount || 0),
                        0,
                      ),
                    ),
                    label: "total members",
                  },
                ]}
              />

              <div className="space-y-8">
                <section>
                  <SectionHeader icon={TrendingUp} label="Popular" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {popularLoading
                      ? [...Array(6)].map((_, i) => (
                          <Sk key={i} className="h-14 rounded-xl" />
                        ))
                      : popularCommunities?.map((comm, i) => (
                          <CommunityCard
                            key={comm._id}
                            comm={comm}
                            badge={
                              i === 0 ? "hot" : i < 3 ? "rising" : undefined
                            }
                            onClick={() =>
                              navigate(`/communities/${comm.name}`)
                            }
                          />
                        ))}
                  </div>
                </section>

                <section>
                  <SectionHeader icon={Clock} label="Recently Created" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {newCommLoading
                      ? [...Array(4)].map((_, i) => (
                          <Sk key={i} className="h-14 rounded-xl" />
                        ))
                      : newCommunities?.map((comm) => (
                          <CommunityCard
                            key={comm._id}
                            comm={comm}
                            badge="new"
                            onClick={() =>
                              navigate(`/communities/${comm.name}`)
                            }
                          />
                        ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {/* ═══ CREATORS VIEW ═══ */}
          {view === "creators" && (
            <motion.div
              key="creators"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <StatBar
                stats={[
                  {
                    icon: Trophy,
                    value: fmt(topCreators?.length || 0),
                    label: "top creators",
                  },
                  {
                    icon: Activity,
                    value: fmt(
                      topCreators?.reduce(
                        (a, c) => a + (c.postCount || 0),
                        0,
                      ) || 0,
                    ),
                    label: "total posts",
                  },
                ]}
              />

              <SidePanel>
                <div className="divide-y divide-border/10">
                  {creatorsLoading
                    ? [...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <Sk className="w-5 h-3 rounded" />
                          <Sk className="w-8 h-8 rounded-full" />
                          <Sk className="h-3 flex-1" />
                          <Sk className="h-2.5 w-16" />
                        </div>
                      ))
                    : topCreators?.map((creator, i) => (
                        <div key={creator.user?._id} className="px-2 py-0.5">
                          <CreatorRow
                            creator={creator}
                            rank={i + 1}
                            navigate={navigate}
                          />
                        </div>
                      ))}
                </div>
              </SidePanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            posts={trendingPosts || []}
            communities={allCommunities}
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Explore;
