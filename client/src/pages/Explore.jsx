import React from "react";
import { useTheme } from "next-themes";
import { useNavigate, Link } from "react-router-dom";
import {
  Compass,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Trophy,
  Zap,
  Tag,
  Hash,
  PenSquare,
  ArrowRight
} from "lucide-react";
import {
  useGetTrendingPostsQuery,
  useGetPopularCommunitiesQuery,
  useGetNewCommunitiesQuery,
  useGetTopCreatorsQuery,
  useGetCommunityCategoriesQuery,
} from "../app/api/exploreApi";
import PostCard from "../components/PostCard";
import { Button } from "../components/ui/button";

const Explore = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Queries
  const { data: trendingPosts, isLoading: trendingLoading } = useGetTrendingPostsQuery();
  const { data: popularCommunities, isLoading: popularLoading } = useGetPopularCommunitiesQuery();
  const { data: newCommunities, isLoading: newLoading } = useGetNewCommunitiesQuery();
  const { data: topCreators, isLoading: creatorsLoading } = useGetTopCreatorsQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetCommunityCategoriesQuery();

  const Skeleton = () => (
    <div className="space-y-4">
      <div className="h-32 bg-muted/20 rounded-xl animate-pulse border border-border/40" />
      <div className="h-32 bg-muted/20 rounded-xl animate-pulse border border-border/40" />
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-8 pb-20">
        <div className="max-w-[1600px] mx-auto space-y-10">
          {/* 1. Page Header */}
          <section className="pb-2">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground/90 flex items-center gap-2.5">
                <Compass className="w-6 h-6 text-primary" strokeWidth={2.5} />
                Explore
              </h1>
              <p className="text-xs text-muted-foreground font-medium max-w-lg leading-relaxed">
                Discover trending discussions, rising communities, and top contributors across the network.
              </p>
            </div>
          </section>

          {/* 2. Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column: Trending Feed */}
            <div className="lg:col-span-8 space-y-8">
              {/* Quick Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {["All", "Technology", "Design", "Gaming", "Health", "Business", "News"].map((cat) => (
                  <button
                    key={cat}
                    className="px-3 py-1 text-[11px] font-bold rounded-lg border border-border/40 bg-muted/20 hover:bg-muted transition-all whitespace-nowrap text-muted-foreground hover:text-foreground"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Trending Discussions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <TrendingUp size={16} className="text-orange-500" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50">Trending Now</h2>
                </div>
                
                <div className="space-y-4">
                  {trendingLoading ? (
                    <Skeleton />
                  ) : trendingPosts?.length > 0 ? (
                    trendingPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))
                  ) : (
                    <div className="py-12 text-center border border-dashed border-border/40 rounded-xl bg-muted/5">
                      <p className="text-xs font-bold text-muted-foreground">No trending posts yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: Sidebar Widgets */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Popular Hubs */}
              <div className="border border-border/40 rounded-xl bg-card p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60 flex items-center gap-2">
                    <Users size={12} /> Top Communities
                  </h3>
                  <Link to="/communities" className="text-[10px] font-bold text-primary hover:underline">View All</Link>
                </div>
                <div className="space-y-3.5">
                  {popularLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-10 bg-muted/20 animate-pulse rounded-lg" />)
                  ) : (
                    popularCommunities?.slice(0, 5).map((community) => (
                      <div 
                        key={community._id}
                        onClick={() => navigate(`/communities/${community.name}`)}
                        className="flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border/40 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}`} alt="" className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold truncate group-hover:text-primary transition-colors">c/{community.name}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{community.members?.length || 0} members</p>
                        </div>
                        <ArrowUpRight size={12} className="text-muted-foreground/30 group-hover:text-primary transition-all" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* New & Rising */}
              <div className="border border-border/40 rounded-xl bg-muted/5 p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Clock size={12} className="text-indigo-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">Rising Hubs</h3>
                </div>
                <div className="space-y-3.5">
                  {newLoading ? (
                    <div className="h-20 bg-muted/20 animate-pulse rounded-lg" />
                  ) : (
                    newCommunities?.slice(0, 3).map((community) => (
                      <Link key={community._id} to={`/communities/${community.name}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-background border border-border/30 overflow-hidden flex items-center justify-center p-0.5">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}`} alt="" className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold truncate group-hover:text-primary">c/{community.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">{community.category || "General"}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Leaderboard Creators */}
              <div className="border border-border/40 rounded-xl bg-card p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                  <Trophy size={12} className="text-yellow-500" />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60">Top Authors</h3>
                </div>
                <div className="space-y-3.5">
                  {creatorsLoading ? (
                    <div className="h-24 bg-muted/20 animate-pulse rounded-lg" />
                  ) : (
                    topCreators?.slice(0, 5).map((creator) => (
                      <Link key={creator.user?._id} to={`/profile/${creator.user?.username}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full border border-border/40 bg-muted overflow-hidden flex items-center justify-center p-0.5">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${creator.user?.username}`} alt="" className="w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold truncate group-hover:text-primary">u/{creator.user?.username}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Zap size={8} /> {creator.postCount} Discussions
                          </p>
                        </div>
                        <ArrowRight size={12} className="text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
