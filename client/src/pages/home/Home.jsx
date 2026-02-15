import React from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Users,
  PenTool,
  Clock,
  ArrowRight,
  MessageSquare,
  Plus,
  LayoutGrid,
} from "lucide-react";

import { useGetPostsQuery } from "@/app/api/postsApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/postCard/PostCard";

const Home = () => {
  const { data: latestPosts = [], isLoading } = useGetPostsQuery({});

  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="flex flex-col items-start gap-10 py-10">
        <div className="space-y-6 max-w-4xl">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-sm text-[10px] uppercase tracking-[0.3em] font-black border-2"
          >
            Public Beta 1.0
          </Badge>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
            Meaningful <br />
            <span className="text-muted-foreground/30">Conversations.</span>
          </h1>

          <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            A minimalist platform for collective knowledge, open communication,
            and refined community engagement.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Button
            size="lg"
            asChild
            className="rounded-md px-8 h-14 text-[11px] font-black uppercase tracking-[0.2em]"
          >
            <Link to="/new-post">
              <Plus className="mr-3 h-4 w-4" /> Start Discussion
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="rounded-md px-8 h-14 text-[11px] font-black uppercase tracking-[0.2em] border-2"
          >
            <Link to="/community">
              <LayoutGrid className="mr-3 h-4 w-4" /> Explore Hubs
            </Link>
          </Button>
        </div>
      </section>

      {/* Core Actions Grid */}
      <section className="grid gap-6 sm:grid-cols-3 border-y border-border/40 py-16">
        {[
          {
            to: "/explore",
            icon: Flame,
            title: "Trending",
            desc: "The most impactful discussions currently in orbit.",
          },
          {
            to: "/new-post",
            icon: PenTool,
            title: "Contribute",
            desc: "Add your signal to the collective stream.",
          },
          {
            to: "/community",
            icon: Users,
            title: "Hubs",
            desc: "Focused environments for specialized knowledge.",
          },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className="group relative p-8 hover:bg-muted/30 transition-all rounded-md"
          >
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-md bg-foreground text-background flex items-center justify-center">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase tracking-widest opacity-60">
                  {item.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Feed Section */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b-2 border-foreground/5 pb-8">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-50 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Real-time Stream
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Latest Activity
            </h2>
          </div>

          {!isLoading && latestPosts.length > 0 && (
            <Button
              variant="ghost"
              asChild
              className="h-10 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-muted"
            >
              <Link to="/explore" className="flex items-center">
                Full Feed <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4 p-6 border-2 rounded-md">
                <Skeleton className="h-6 w-3/4 rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-1/2 rounded-sm" />
              </div>
            ))}
          </div>
        ) : latestPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.slice(0, 9).map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-md space-y-6">
            <MessageSquare className="h-8 w-8 text-muted-foreground/20" />
            <div className="space-y-2">
              <p className="text-sm font-black uppercase tracking-widest">
                The silence is absolute
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                Be the catalyst for a new conversation
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="font-black uppercase tracking-widest border-2 h-10 px-8"
            >
              <Link to="/new-post text-xs">Initialize Thread</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
