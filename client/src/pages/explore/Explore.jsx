import React from "react";
import { motion } from "framer-motion";
import {
  Flame,
  TrendingUp,
  Filter,
  AlertCircle,
  LogIn,
  Hash,
  Users,
  List,
  Grid,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { useGetPostsQuery } from "@/app/api/postsApi";
import { useGetCommunitiesQuery } from "@/app/api/communitiesApi";
import PostCard from "@/components/postCard/PostCard";
import CommunityCard from "@/components/communitycard/CommunityCard";

const ExplorePage = () => {
  const {
    data: posts = [],
    isLoading: loadingPosts,
    error: postError,
  } = useGetPostsQuery();
  const { data: communities = [], isLoading: loadingComms } =
    useGetCommunitiesQuery();

  const isAuthError =
    postError && "status" in postError && postError.status === 401;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <aside className="md:col-span-3 space-y-8">
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                Feed
              </h2>
              <nav className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-xs font-bold uppercase tracking-tight data-[active=true]:bg-muted"
                  data-active="true"
                >
                  <TrendingUp className="h-4 w-4 mr-3" /> Popular
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-9 px-3 text-xs font-bold uppercase tracking-tight text-muted-foreground"
                >
                  <Flame className="h-4 w-4 mr-3" /> All
                </Button>
              </nav>
            </div>

            <Separator />

            <Card className="border shadow-none rounded-md bg-muted/5 overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                  Find spaces that interest you or create your own.
                </p>
                <Button
                  size="sm"
                  className="w-full h-8 text-[10px] font-bold uppercase tracking-tighter"
                >
                  New Community
                </Button>
              </CardContent>
            </Card>
          </aside>

          <main className="md:col-span-6 space-y-6">
            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="bg-transparent h-10 p-0 gap-6 border-b rounded-none w-full justify-start mb-6">
                <TabsTrigger
                  value="trending"
                  className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
                >
                  Popular
                </TabsTrigger>
                <TabsTrigger
                  value="newest"
                  className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
                >
                  Newest
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="mt-0">
                <div className="space-y-4">
                  {isAuthError ? (
                    <Alert
                      variant="destructive"
                      className="border-border bg-muted/5 text-foreground shadow-none"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-xs font-bold uppercase tracking-tight">
                        Authentication Required
                      </AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground mt-2">
                        Please sign in to view the trending discussions.
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 h-8 text-[10px] font-bold uppercase"
                          onClick={() => (window.location.href = "/login")}
                        >
                          <LogIn className="h-3 w-3 mr-2" /> Sign In
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : loadingPosts ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </main>

          <aside className="md:col-span-3 hidden xl:block space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                Trending Communities
              </h3>
              {loadingComms ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {communities.slice(0, 5).map((c) => (
                    <div
                      key={c._id}
                      className="group p-2 rounded-md hover:bg-muted/50 border border-transparent transition-colors"
                    >
                      <CommunityCard community={c} variant="minimal" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <footer className="px-1 space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                Discussly &copy; 2024
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {["Privacy", "Content Policy", "User Agreement"].map((item) => (
                  <button
                    key={item}
                    className="text-[9px] text-muted-foreground/60 hover:text-foreground font-bold tracking-tight uppercase"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </footer>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
