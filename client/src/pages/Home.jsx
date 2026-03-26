import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreatePostModal } from "../components/modals/CreatePostModal";
import PostCard from "../components/PostCard";
import { cn, getAvatarUrl } from "@/lib/utils";

/* ── Feed sort tabs ── */
const SORT_TABS = [
  { id: "hot", label: "Hot", Icon: Flame },
  { id: "new", label: "New", Icon: Sparkles },
  { id: "top", label: "Top", Icon: BarChart2 },
  { id: "rise", label: "Rising", Icon: TrendingUp },
];

/* ── Trending topics (mock — replace with real API) ── */
const TRENDING = [
  { tag: "webdev", posts: "2.4k" },
  { tag: "technology", posts: "1.8k" },
  { tag: "design", posts: "940" },
  { tag: "science", posts: "720" },
  { tag: "gaming", posts: "610" },
];

/* ── Post skeleton ── */
const PostSkeleton = () => (
  <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 animate-pulse">
    <div className="flex items-center gap-3">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-2.5 w-20 rounded" />
      </div>
    </div>
    <Skeleton className="h-4 w-3/4 rounded" />
    <Skeleton className="h-3 w-full rounded" />
    <Skeleton className="h-3 w-2/3 rounded" />
    <div className="flex gap-3 pt-1">
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-7 w-16 rounded-lg" />
      <Skeleton className="h-7 w-16 rounded-lg" />
    </div>
  </div>
);

/* ════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const [sort, setSort] = useState("hot");

  const { data: posts, isLoading, isError } = useGetPostsQuery();

  /* ── Derived: sort client-side ── */
  const sortedPosts = React.useMemo(() => {
    if (!posts) return [];
    const arr = [...posts];
    if (sort === "new")
      return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "top")
      return arr.sort(
        (a, b) => (b.upvotes?.length ?? 0) - (a.upvotes?.length ?? 0),
      );
    return arr; // hot / rising = default order from API
  }, [posts, sort]);

  return (
    <div className="h-full w-full flex justify-center overflow-hidden">
      <div className="max-w-[1600px] w-full flex gap-12 px-8 md:px-12 py-8 h-full">
        {/* ════════ MAIN FEED ════════ */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-20">
          {/* ── Quick-compose bar ── */}
          {userInfo && (
            <div className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-border/40 bg-muted shrink-0">
                <img
                  src={getAvatarUrl(userInfo)}
                  alt="me"
                  className="w-full h-full"
                />
              </div>
              <CreatePostModal>
                <button className="flex-1 text-left h-9 px-4 rounded-xl bg-muted/40 hover:bg-muted/70 border border-border/40 hover:border-border/70 text-[13px] text-muted-foreground/60 font-medium transition-all cursor-text">
                  What's on your mind?
                </button>
              </CreatePostModal>
              <CreatePostModal>
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl text-[13px] font-bold shrink-0 gap-1.5"
                >
                  <PenSquare size={13} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Post</span>
                </Button>
              </CreatePostModal>
            </div>
          )}

          {/* ── Sort tabs ── */}
          <div className="flex items-center gap-1 bg-card border border-border/50 rounded-xl p-1 shadow-sm">
            {SORT_TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSort(id)}
                className={cn(
                  "flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-150",
                  sort === id
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                <Icon size={13} strokeWidth={2.2} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ── Feed ── */}
          <div className="space-y-3">
            {/* Loading */}
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}

            {/* Error */}
            {isError && (
              <div className="flex flex-col items-center gap-3 py-12 bg-card border border-destructive/20 rounded-2xl text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-destructive/60" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground/80">
                    Couldn't load feed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check your connection and try again.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-semibold"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !isError && sortedPosts.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-16 bg-card border border-dashed border-border/60 rounded-2xl text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground/70">
                    Nothing here yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Be the first to start a discussion!
                  </p>
                </div>
                <CreatePostModal>
                  <Button
                    size="sm"
                    className="rounded-xl text-xs font-bold gap-1.5"
                  >
                    <PenSquare size={12} strokeWidth={2.5} />
                    Create Post
                  </Button>
                </CreatePostModal>
              </div>
            )}

            {/* Posts */}
            {!isLoading &&
              sortedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
          </div>
        </main>

        {/* ════════ SIDEBAR ════════ */}
        <aside className="hidden lg:flex flex-col gap-2 w-[252px] h-full! shrink-0 pt-0">
          {/* ── Create card ── */}
          <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="" className="w-8 h-8 object-contain" />
              <span className="text-sm font-black tracking-tight text-foreground uppercase">
                Discussly
              </span>
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              Your home for discussions, communities, and ideas. Dive in.
            </p>
            <Separator className="bg-border/40" />
            <div className="space-y-2">
              <CreatePostModal>
                <Button
                  size="sm"
                  className="w-full h-9 rounded-xl text-[12.5px] font-bold gap-2"
                >
                  <PenSquare size={13} strokeWidth={2.5} />
                  Create Post
                </Button>
              </CreatePostModal>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 rounded-xl text-[12.5px] font-semibold gap-2"
                onClick={() => navigate("/communities/create")}
              >
                <Hash size={13} strokeWidth={2.5} />
                Create Community
              </Button>
            </div>
          </div>

          {/* ── Trending topics ── */}
          <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Trending
              </h3>
              <Flame size={13} className="text-orange-400" />
            </div>
            <div className="space-y-0.5">
              {TRENDING.map(({ tag, posts: count }, i) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/explore?tag=${tag}`)}
                  className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black text-muted-foreground/40 w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="text-left">
                      <p className="text-[13px] font-bold text-foreground/90 group-hover:text-foreground">
                        #{tag}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 font-medium">
                        {count} posts
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={13}
                    className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors"
                  />
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 rounded-xl text-[12px] font-semibold text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/explore")}
            >
              See all trending →
            </Button>
          </div>

          {/* ── Quick stats ── */}
          <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Community
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  Icon: Users,
                  label: "Members online",
                  value: "1,024",
                  color: "text-green-500",
                  dot: true,
                },
                {
                  Icon: Globe,
                  label: "Active communities",
                  value: "342",
                  color: "text-blue-400",
                },
                {
                  Icon: Zap,
                  label: "Posts today",
                  value: `${posts?.length ?? "—"}`,
                  color: "text-orange-400",
                },
              ].map(({ Icon, label, value, color, dot }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground font-medium">
                    <Icon size={13} className={color} strokeWidth={2} />
                    {label}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-[11.5px] font-bold",
                      color,
                    )}
                  >
                    {dot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer links ── */}
          <div className="px-1 flex flex-wrap gap-x-3 gap-y-1">
            {["Help", "About", "Terms", "Privacy", "Rules"].map((l) => (
              <button
                key={l}
                className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors font-medium"
              >
                {l}
              </button>
            ))}
            <span className="text-[11px] text-muted-foreground/30 w-full mt-0.5">
              © {new Date().getFullYear()} Discussly
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
