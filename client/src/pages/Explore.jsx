import React, { useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Compass,
  TrendingUp,
  Users,
  Trophy,
  Zap,
  Flame,
  Sparkles,
} from "lucide-react";
import {
  useGetTrendingPostsQuery,
  useGetPopularCommunitiesQuery,
  useGetNewCommunitiesQuery,
  useGetTopCreatorsQuery,
  useGetCommunityCategoriesQuery,
} from "../app/api/exploreApi";
import PostCard from "../components/PostCard";

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn, getAvatarUrl, getCommunityIconUrl } from "@/lib/utils";
import { motion } from "framer-motion";

/* ── Skeletons ── */
const HeroSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
    <Card className="lg:col-span-5 h-[340px] p-6 flex flex-col justify-end shadow-none">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2" />
    </Card>
    <Card className="lg:col-span-3 h-[340px] p-6 shadow-none">
      <Skeleton className="h-full w-full" />
    </Card>
    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-3 h-[340px]">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="shadow-none">
          <Skeleton className="h-full w-full" />
        </Card>
      ))}
    </div>
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
  const { data: topCreators, isLoading: creatorsLoading } =
    useGetTopCreatorsQuery();

  const FILTER_CATEGORIES = [
    "All",
    "Technology",
    "Design",
    "Gaming",
    "Health",
    "Business",
    "News",
  ];

  // Derived Data
  const top5Posts = trendingPosts?.slice(0, 5) || [];
  const remainingPosts = trendingPosts?.slice(5) || [];
  const featuredCommunity = popularCommunities?.[0];
  const top6Creators = topCreators?.slice(0, 6) || [];

  // Auto-scroll logic for carousel (optional enhancement)
  useEffect(() => {
    if (!carouselRef.current || top5Posts.length <= 1) return;
    const interval = setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carouselRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [top5Posts.length]);

  return (
    <div className="w-full h-full flex flex-col bg-background min-h-0 overflow-hidden font-sans">
      {/* ── Header ── */}
      <header className="shrink-0 px-6 py-4 border-b bg-background flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted/50 rounded-lg text-foreground border border-border/40">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Explore</h1>
            <p className="text-xs text-muted-foreground font-medium">
              The pulse of your network
            </p>
          </div>
        </div>
      </header>

      {/* ── Scrollable Content Area ── */}
      <ScrollArea className="flex-1">
        <div className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
          {/* ── Category Tags (Top of Page) ── */}
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex items-center gap-2">
              {FILTER_CATEGORIES.map((cat, idx) => (
                <Badge
                  key={cat}
                  variant={idx === 0 ? "default" : "secondary"}
                  className={cn(
                    "px-5 py-2 text-xs font-semibold cursor-pointer rounded-full transition-all duration-300 hover:scale-105",
                    idx !== 0 &&
                      "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50",
                  )}
                >
                  {cat}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>

          {/* ── Hero Section: Single Responsive Row ── */}
          {trendingLoading || popularLoading || creatorsLoading ? (
            <HeroSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* 1. Top Discussion Carousel (Col Span 5) */}
              <Card className="lg:col-span-5 h-[340px] shadow-none border-border/60 overflow-hidden bg-card relative group">
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full scroll-smooth"
                >
                  {top5Posts.map((post) => (
                    <div
                      key={post._id}
                      className="min-w-full h-full snap-center p-6 md:p-8 flex flex-col justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-transparent w-fit"
                        >
                          <Flame className="w-3 h-3 mr-1.5" /> Top Discussion
                        </Badge>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground line-clamp-3 leading-snug">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground mt-3 line-clamp-2 text-sm leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-6">
                        <Avatar className="w-9 h-9 border border-border/50">
                          <AvatarImage src={getAvatarUrl(post.author)} />
                          <AvatarFallback>
                            {post.author?.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            u/{post.author?.username}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            in c/{post.community?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Carousel Indicators (Optional visual cue) */}
                <div className="absolute bottom-4 right-6 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {top5Posts.map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-border/80"
                    />
                  ))}
                </div>
              </Card>

              {/* 2. Spotlight Hub (Col Span 3) */}
              {featuredCommunity && (
                <Card
                  className="lg:col-span-3 h-[340px] shadow-none border-border/60 bg-muted/10 hover:bg-muted/20 transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-center text-center p-6"
                  onClick={() =>
                    navigate(`/communities/${featuredCommunity.name}`)
                  }
                >
                  <Badge
                    variant="outline"
                    className="mb-6 bg-background border-border/50 shadow-sm px-3 py-1"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5 text-yellow-500" />{" "}
                    Spotlight Hub
                  </Badge>
                  <Avatar className="w-24 h-24 border-4 border-background shadow-md mb-5">
                    <AvatarImage
                      src={getCommunityIconUrl(featuredCommunity)}
                    />
                    <AvatarFallback>
                      {featuredCommunity.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-bold tracking-tight">
                    c/{featuredCommunity.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-2 mb-5 line-clamp-2 px-2">
                    {featuredCommunity.description ||
                      "Everything you need to know. Joined by experts."}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background px-4 py-1.5 rounded-full border border-border/40 shadow-sm">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    {(
                      featuredCommunity.members?.length || 0
                    ).toLocaleString()}{" "}
                    Members
                  </div>
                </Card>
              )}

              {/* 3. Top Voices Grid (Col Span 4) */}
              <div className="lg:col-span-4 h-[340px] flex flex-col">
                <div className="flex items-center gap-2 px-1 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    Top Voices
                  </h2>
                </div>
                {/* 2x3 Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-3 flex-1 h-full">
                  {top6Creators.map((creator) => (
                    <Card
                      key={creator.user?._id}
                      className="shadow-none border-border/60 bg-card hover:border-primary/40 transition-all hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-center p-3 text-center"
                      onClick={() =>
                        navigate(`/profile/${creator.user?.username}`)
                      }
                    >
                      <Avatar className="w-12 h-12 border border-border/50 mb-2">
                        <AvatarImage src={getAvatarUrl(creator.user)} />
                        <AvatarFallback>
                          {creator.user?.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h4 className="text-[11px] font-bold truncate w-full group-hover:text-primary transition-colors">
                        u/{creator.user?.username}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-muted-foreground">
                        <Zap className="w-3 h-3 text-yellow-500" />{" "}
                        {creator.postCount} Posts
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="py-2">
            <div className="h-px w-full bg-border/40" />
          </div>

          {/* ── More Trending Discussions ── */}
          <section className="max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 px-1 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                More Trending Discussions
              </h2>
            </div>

            <div className="space-y-4">
              {trendingLoading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4 shadow-none border-border/50">
                    <Skeleton className="h-32 w-full" />
                  </Card>
                ))
              ) : remainingPosts.length > 0 ? (
                remainingPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center border border-dashed border-border/40 rounded-xl bg-muted/5">
                  <p className="text-sm font-medium text-muted-foreground">
                    You've caught up with all trending posts.
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
