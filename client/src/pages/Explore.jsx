import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  TrendingUp,
  Users,
  Trophy,
  Zap,
  Flame,
  Sparkles,
  Rocket,
  Plus,
} from "lucide-react";
import {
  useGetTrendingPostsQuery,
  useGetPopularCommunitiesQuery,
  useGetNewCommunitiesQuery,
  useGetTopCreatorsQuery,
} from "../app/api/exploreApi";
import PostCard from "../components/PostCard";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn, getAvatarUrl, getCommunityIconUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ── Skeletons ── */
const HeroSkeleton = () => (
  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 mb-10 transition-all duration-500">
    <Card className="lg:col-span-8 min-h-[400px] p-8 border-border/40 shadow-none bg-muted/5 rounded-3xl">
      <Skeleton className="h-10 w-2/3 mb-4 rounded-lg" />
      <Skeleton className="h-4 w-1/3 rounded-md" />
    </Card>
    <Card className="lg:col-span-4 min-h-[400px] p-8 border-border/40 shadow-none bg-muted/5 rounded-3xl">
      <Skeleton className="h-full w-full rounded-2xl" />
    </Card>
  </div>
);

const Explore = () => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // Queries
  const { data: trendingPosts, isLoading: trendingLoading } =
    useGetTrendingPostsQuery();
  const { data: popularCommunities, isLoading: popularLoading } =
    useGetPopularCommunitiesQuery();
  const { data: newCommunities, isLoading: newCommLoading } =
    useGetNewCommunitiesQuery();
  const { data: topCreators, isLoading: creatorsLoading } =
    useGetTopCreatorsQuery();

  // Derived Data
  const top4Posts = trendingPosts?.slice(0, 4) || [];
  const feedPosts = trendingPosts?.slice(4) || [];
  const featuredCommunity = popularCommunities?.[0];
  const topCreatorsList = topCreators?.slice(0, 4) || [];

  // Auto-scroll logic for carousel
  useEffect(() => {
    if (!carouselRef.current || top4Posts.length <= 1) return;
    const interval = setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [top4Posts.length]);

  return (
    <div className="w-full h-full flex flex-col bg-background selection:bg-primary/10 overflow-x-hidden">
      {/* ── Simplified Header ── */}
      <header className="shrink-0 px-6 sm:px-10 py-6 border-b border-border/10 bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Discover
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Exploring the pulse of Discussly
          </p>
        </div>
      </header>

      {/* ── Scrollable Content Area ── */}
      <ScrollArea className="flex-1">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-20">
          {/* ── Hero Discovery ── */}
          {trendingLoading || popularLoading || creatorsLoading ? (
            <HeroSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:grid lg:grid-cols-12 gap-6"
            >
              {/* 1. Feature Carousel (Col Span 8) */}
              <Card className="lg:col-span-8 flex flex-col min-h-[400px] lg:min-h-[450px] shadow-none border-border/40 overflow-hidden bg-muted/5 relative group rounded-[2.5rem] isolate border-none">
                <div className="absolute inset-0 bg-linear-to-br from-primary/3 to-transparent -z-10" />
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full scroll-smooth flex-1"
                >
                  {top4Posts.map((post) => (
                    <div
                      key={post._id}
                      className="min-w-full w-full p-8 sm:p-12 flex flex-col justify-between cursor-pointer group/slide"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      <div className="max-w-2xl space-y-6">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-primary" />
                          <span className="text-[11px] font-bold uppercase tracking-tight text-primary/80">
                            Trending now
                          </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground line-clamp-2 leading-[1.15]">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground text-base sm:text-lg line-clamp-2 font-medium">
                          {post.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-8">
                        <Avatar className="w-12 h-12 border border-border/20">
                          <AvatarImage src={getAvatarUrl(post.author)} />
                          <AvatarFallback className="text-xs font-bold">
                            {post.author?.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            u/{post.author?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            in c/{post.community?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Visual Pager */}
                <div className="absolute bottom-10 right-10 flex gap-2">
                  {top4Posts.map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-foreground/10 group-hover:bg-primary/20 transition-colors"
                    />
                  ))}
                </div>
              </Card>

              {/* 2. Spotlight & Top Talent (Col Span 4) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {featuredCommunity && (
                  <Card
                    className="flex-1 shadow-none border-border/40 bg-muted/5 hover:bg-muted/10 transition-all rounded-[2rem] flex flex-col items-center justify-center text-center p-8 group/spot"
                    onClick={() =>
                      navigate(`/communities/${featuredCommunity.name}`)
                    }
                  >
                    <div className="mb-6 px-4 py-1.5 border border-border/60 bg-background rounded-full text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                      Featured Community
                    </div>
                    <Avatar className="w-24 h-24 mb-6 ring-4 ring-background shadow-sm transition-transform group-hover/spot:scale-105">
                      <AvatarImage
                        src={getCommunityIconUrl(featuredCommunity)}
                      />
                      <AvatarFallback className="text-xl font-bold bg-muted">
                        {featuredCommunity.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">
                      c/{featuredCommunity.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-4">
                      <Users className="w-4 h-4" />{" "}
                      {(
                        featuredCommunity.members?.length || 0
                      ).toLocaleString()}{" "}
                      Members
                    </div>
                  </Card>
                )}

                <Card className="p-6 bg-muted/5 rounded-[2rem] border-none">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                      Top Voices
                    </span>
                    <Trophy className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {topCreatorsList.map((creator) => (
                      <Avatar
                        key={creator.user?._id}
                        className="w-full h-auto aspect-square border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                        onClick={() =>
                          navigate(`/profile/${creator.user?.username}`)
                        }
                      >
                        <AvatarImage src={getAvatarUrl(creator.user)} />
                        <AvatarFallback className="text-[10px] font-bold">
                          {creator.user?.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ── Arrivals (Simplified) ── */}
          <section className="space-y-8">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold tracking-tight">
                Recent Arrivals
              </h2>
              <p className="text-sm text-muted-foreground">
                Newly established communities making waves
              </p>
            </div>

            <ScrollArea className="w-full whitespace-nowrap pb-4">
              <div className="flex gap-4">
                {newCommLoading
                  ? [...Array(4)].map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-40 w-64 rounded-[2rem] bg-muted/5"
                      />
                    ))
                  : newCommunities?.slice(0, 8).map((comm) => (
                      <Card
                        key={comm._id}
                        className="min-w-[280px] p-8 shadow-none border-border/10 bg-muted/5 hover:bg-background transition-all group/comm cursor-pointer rounded-[2.5rem]"
                        onClick={() => navigate(`/communities/${comm.name}`)}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <Avatar className="w-14 h-14 border-2 border-background">
                            <AvatarImage src={getCommunityIconUrl(comm)} />
                            <AvatarFallback className="font-bold">
                              {comm.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-sm font-semibold truncate">
                              c/{comm.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                              {comm.category || "General"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-muted/50 px-3 py-1 rounded-full text-muted-foreground uppercase tracking-tight">
                            New Arrival
                          </span>
                          <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      </Card>
                    ))}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </section>

          {/* ── Unified Discover Feed (Super Minimal) ── */}
          <section className="max-w-[850px] mx-auto w-full pb-20 space-y-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                Deep Dive
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Curated discussions from around your network
              </p>
            </div>

            <div className="space-y-8">
              {trendingLoading ? (
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="py-8 border-b border-border/10 animate-pulse"
                  >
                    <Skeleton className="h-4 w-1/4 mb-4" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))
              ) : feedPosts.length > 0 ? (
                <div className="divide-y divide-border/10">
                  {feedPosts.map((post) => (
                    <div
                      key={post._id}
                      className="py-10 first:pt-0 group cursor-pointer"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                          <AvatarImage src={getAvatarUrl(post.author)} />
                          <AvatarFallback>
                            {post.author?.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          u/{post.author?.username} in {post.community?.name}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 leading-tight mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-t border-dashed border-border/40">
                  <p className="text-sm text-muted-foreground font-medium">
                    You've reached the end of the discoveries.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Explore;
