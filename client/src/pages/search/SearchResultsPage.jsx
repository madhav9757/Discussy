// client/src/pages/search/SearchResultsPage.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquare,
  Hash,
  User as UserIcon,
  Inbox,
  ArrowLeft,
} from "lucide-react";

import { useSearchQuery } from "@/app/api/searchApi";
import PostCard from "@/components/postCard/PostCard";
import CommunityCard from "@/components/communitycard/CommunityCard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "all";

  const [localQuery, setLocalQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(typeParam);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSearchQuery(
    { q: queryParam, type: activeTab, page, limit: 20 },
    { skip: !queryParam || queryParam.length < 2 },
  );

  useEffect(() => {
    setLocalQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim(), type: activeTab });
      setPage(1);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSearchParams({ q: queryParam, type: value });
  };

  const results = data?.results || {};
  const metadata = data?.metadata || {};
  const totalResults = metadata.resultCounts?.total || 0;
  const hasResults = totalResults > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4 space-y-12">
        <header className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Search</h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder="Find posts, communities, or people..."
                  className="pl-10 h-11 border-2 focus-visible:ring-0 focus-visible:border-foreground transition-all"
                />
              </div>
              <Button
                type="submit"
                className="h-11 px-6 font-bold uppercase tracking-tight text-xs"
              >
                Search
              </Button>
            </form>

            {queryParam && !isLoading && (
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">
                Found {totalResults} matches for "{queryParam}"
              </p>
            )}
          </div>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="bg-transparent h-10 p-0 gap-8 border-b rounded-none w-full justify-start">
            {["all", "posts", "communities", "users"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="pt-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))}
              </div>
            ) : hasResults ? (
              <TabsContent value={activeTab} className="mt-0 space-y-10">
                {(activeTab === "all" || activeTab === "posts") &&
                  results.posts?.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
                        Discussions
                      </h3>
                      <div className="grid gap-4">
                        {results.posts.map((post) => (
                          <PostCard key={post._id} post={post} />
                        ))}
                      </div>
                    </section>
                  )}

                {(activeTab === "all" || activeTab === "communities") &&
                  results.communities?.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
                        Communities
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.communities.map((community) => (
                          <div
                            key={community._id}
                            className="p-1 rounded-md border border-border/50 hover:bg-muted/10 transition-colors"
                          >
                            <CommunityCard
                              community={community}
                              variant="minimal"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {(activeTab === "all" || activeTab === "users") &&
                  results.users?.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
                        People
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.users.map((user) => (
                          <Link key={user._id} to={`/profile/${user._id}`}>
                            <Card className="shadow-none rounded-md hover:bg-muted/10 border-border/50 transition-colors">
                              <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-10 w-10 border shadow-sm">
                                  <AvatarImage src={user.image} />
                                  <AvatarFallback className="font-bold text-xs">
                                    {user.username[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">
                                    u/{user.username}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                    {user.followerCount || 0} followers
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
              </TabsContent>
            ) : (
              queryParam && (
                <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed rounded-md bg-muted/5">
                  <Inbox className="h-8 w-8 text-muted-foreground/20 mb-3" />
                  <h3 className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                    No results found
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-tight">
                    Try different keywords
                  </p>
                </div>
              )
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchResultsPage;
