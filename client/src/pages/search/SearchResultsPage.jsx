// client/src/pages/search/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ArrowUpDown, 
  MessageSquare, Hash, User as UserIcon,
  Loader2, SlidersHorizontal
} from 'lucide-react';

import { useSearchQuery } from '@/app/api/searchApi';
import PostCard from '@/components/postCard/PostCard';
import CommunityCard from '@/components/communitycard/CommunityCard';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';
  
  const [localQuery, setLocalQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState(typeParam);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useSearchQuery(
    { q: queryParam, type: activeTab, page, limit: 20 },
    { skip: !queryParam || queryParam.length < 2 }
  );

  useEffect(() => {
    setLocalQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setPage(1); // Reset page when tab changes
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
  const postsCount = metadata.resultCounts?.posts || 0;
  const communitiesCount = metadata.resultCounts?.communities || 0;
  const usersCount = metadata.resultCounts?.users || 0;

  const hasResults = totalResults > 0;

  return (
    <div className="container max-w-7xl py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Search Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-5 w-5" />
            <span className="text-sm font-medium">Search Results</span>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search Discussly..."
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="px-8">
              Search
            </Button>
          </form>

          {queryParam && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  'Searching...'
                ) : (
                  <>
                    Found <span className="font-bold text-foreground">{totalResults}</span> results for{' '}
                    <span className="font-bold text-foreground">"{queryParam}"</span>
                  </>
                )}
              </p>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Results Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-8">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-3"
            >
              <div className="flex items-center gap-2">
                <span>All Results</span>
                {totalResults > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {totalResults}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="posts"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-3"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Posts</span>
                {postsCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {postsCount}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="communities"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-3"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span>Communities</span>
                {communitiesCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {communitiesCount}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-3"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Users</span>
                {usersCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {usersCount}
                  </Badge>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* All Results Tab */}
          <TabsContent value="all" className="mt-8">
            <AnimatePresence mode="wait">
              {!isLoading && hasResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Posts Section */}
                  {results.posts?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Posts
                      </h3>
                      <div className="grid gap-4">
                        {results.posts.map((post) => (
                          <PostCard key={post._id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Communities Section */}
                  {results.communities?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Hash className="h-5 w-5 text-emerald-500" />
                        Communities
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.communities.map((community) => (
                          <CommunityCard key={community._id} community={community} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users Section */}
                  {results.users?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-purple-500" />
                        Users
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.users.map((user) => (
                          <Link key={user._id} to={`/user/${user._id}`}>
                            <Card className="hover:border-primary/30 transition-all">
                              <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={user.image} />
                                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-bold">u/{user.username}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {user.bio || 'No bio'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {user.followerCount} followers
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Posts Only Tab */}
          <TabsContent value="posts" className="mt-8">
            {!isLoading && results.posts?.length > 0 && (
              <div className="grid gap-4">
                {results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Communities Only Tab */}
          <TabsContent value="communities" className="mt-8">
            {!isLoading && results.communities?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.communities.map((community) => (
                  <CommunityCard key={community._id} community={community} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Only Tab */}
          <TabsContent value="users" className="mt-8">
            {!isLoading && results.users?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((user) => (
                  <Link key={user._id} to={`/user/${user._id}`}>
                    <Card className="hover:border-primary/30 transition-all">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image} />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-bold">u/{user.username}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {user.bio || 'No bio'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.followerCount} followers
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {!isLoading && !hasResults && queryParam && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find anything matching "{queryParam}". Try different keywords or check your spelling.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setLocalQuery('');
                  setSearchParams({});
                }}
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default SearchResultsPage;