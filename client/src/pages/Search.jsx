import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchQuery } from "../app/api/searchApi";
import { useDebounce } from "../hooks/useDebounce";
import { getAvatarUrl, getCommunityIconUrl } from "@/lib/utils";

// shadcn/ui
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// lucide icons
import {
  Search as SearchIcon,
  Loader2,
  Hash,
  User,
  MessageSquare,
  Trophy,
} from "lucide-react";

import PostCard from "../components/PostCard";
import { cn } from "@/lib/utils";

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, isError } = useSearchQuery(
    { q: debouncedSearchTerm },
    { skip: debouncedSearchTerm.length < 2 },
  );

  const hasResults =
    data?.results &&
    (data.results.posts?.length > 0 ||
      data.results.communities?.length > 0 ||
      data.results.users?.length > 0);

  return (
    <div className="w-full min-h-screen bg-background flex flex-col font-sans">
      <div className="max-w-3xl mx-auto w-full px-6 py-8 md:py-12 space-y-8">
        {/* ── Search Input ── */}
        <div className="relative w-full group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            className="pl-12 h-14 text-base rounded-full border-border/50 bg-muted/20 hover:bg-muted/40 focus:bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-none transition-all placeholder:text-muted-foreground"
            placeholder="Search communities, users, or posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {/* ── Search Results Area ── */}
        <div className="min-h-[300px] flex flex-col">
          {/* Initial State */}
          {debouncedSearchTerm.length < 2 && (
            <div className="m-auto flex flex-col items-center justify-center text-center gap-4 py-20">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <SearchIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Find anything
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Search for discussions, hubs, or people.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && debouncedSearchTerm.length >= 2 && (
            <div className="m-auto flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Searching network...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center">
              An error occurred while searching. Please try again.
            </div>
          )}

          {/* No Results State */}
          {data && !hasResults && !isLoading && (
            <div className="m-auto flex flex-col items-center justify-center text-center gap-3 py-20">
              <div className="w-12 h-12 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-2">
                <SearchIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">
                No results found
              </p>
              <p className="text-sm text-muted-foreground">
                We couldn't find anything matching "{debouncedSearchTerm}"
              </p>
            </div>
          )}

          {/* Results List */}
          {hasResults && !isLoading && (
            <div className="space-y-8 pb-10">
              {/* Communities & Users List */}
              {(data.results.communities?.length > 0 ||
                data.results.users?.length > 0) && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      Profiles & Hubs
                    </h3>
                  </div>

                  <Card className="shadow-none border-border/50 overflow-hidden bg-card">
                    <div className="flex flex-col divide-y divide-border/40">
                      {/* Communities */}
                      {data.results.communities?.map((community) => (
                        <div
                          key={community._id}
                          onClick={() =>
                            navigate(`/communities/${community.name}`)
                          }
                          className="p-4 hover:bg-muted/30 cursor-pointer flex items-center gap-4 transition-colors group"
                        >
                          <Avatar className="w-10 h-10 border border-border/50 rounded-full">
                            <AvatarImage
                              src={getCommunityIconUrl(community)}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {community.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              c/{community.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Hash className="w-3 h-3" /> Community •{" "}
                              {(
                                community.members?.length ||
                                community.memberCount ||
                                0
                              ).toLocaleString()}{" "}
                              members
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Users */}
                      {data.results.users?.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => navigate(`/profile/${user.username}`)}
                          className="p-4 hover:bg-muted/30 cursor-pointer flex items-center gap-4 transition-colors group"
                        >
                          <Avatar className="w-10 h-10 border border-border/50 group-hover:shadow-sm transition-all rounded-full">
                            <AvatarImage
                              src={getAvatarUrl(user)}
                              className="object-cover"
                            />
                            <AvatarFallback>
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              u/{user.username}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Trophy className="w-3 h-3" /> User •{" "}
                              {user.followerCount || 0} followers
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              )}

              {/* Posts section */}
              {data.results.posts?.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      Discussions
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {data.results.posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
