import React, { useState } from "react";
import { useSearchQuery } from "../app/api/searchApi";
import { Input } from "../components/ui/input";
import {
  Search as SearchIcon,
  Loader2,
  Hash,
  User,
  FileText,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

import PostCard from "../components/PostCard";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, isError } = useSearchQuery(
    { q: debouncedSearchTerm },
    { skip: debouncedSearchTerm.length < 2 },
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <SearchIcon className="h-5 w-5" />
        </div>
        <Input
          className="pl-12 h-14 text-base rounded-full border-border/60 bg-card focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary shadow-sm placeholder:text-muted-foreground/60 transition-all duration-200"
          placeholder="Search for communities, users, or posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="min-h-[400px] border border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm flex flex-col">
        {debouncedSearchTerm.length < 2 && (
          <div className="m-auto text-sm text-muted-foreground/80 flex flex-col items-center gap-4">
            <SearchIcon className="w-12 h-12 text-muted-foreground/20" />
            <p>Start typing to search...</p>
          </div>
        )}

        {isLoading && debouncedSearchTerm.length >= 2 && (
          <div className="flex p-6 items-center justify-center flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
            <span className="ml-3 text-sm text-muted-foreground font-medium">
              Searching data...
            </span>
          </div>
        )}

        {isError && (
          <div className="p-6 text-sm font-medium text-destructive bg-destructive/5 m-4 rounded-2xl border border-destructive/20 text-center">
            Unable to complete search. Please try again.
          </div>
        )}

        {data && data.results && Object.values(data.results).flat().length === 0 && (
          <div className="m-auto text-sm text-muted-foreground/80 flex flex-col items-center gap-4">
            <span className="text-4xl text-muted-foreground/30">0</span>
            <p>No matching results found.</p>
          </div>
        )}

        {data && data.results && (
          <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
            {/* Posts section */}
            {data.results.posts?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground px-2">POSTS</h3>
                {data.results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}

            {/* Communities & Users List */}
            {(data.results.communities?.length > 0 || data.results.users?.length > 0) && (
              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-bold text-foreground px-2">RESULTS</h3>
                <div className="divide-y divide-border/40 bg-muted/20 rounded-2xl border border-border/50">
                  {data.results.communities?.map((community) => (
                    <div
                      key={community._id}
                      className="p-4 hover:bg-muted/40 cursor-pointer flex items-center gap-4 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                         <Hash size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground/90 truncate">c/{community.name}</div>
                        <div className="text-xs text-muted-foreground">Community • {community.memberCount} members</div>
                      </div>
                    </div>
                  ))}

                  {data.results.users?.map((user) => (
                    <div
                      key={user._id}
                      className="p-4 hover:bg-muted/40 cursor-pointer flex items-center gap-4 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted border border-border/40 overflow-hidden shrink-0">
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`} alt={user.username} className="w-full h-full p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground/90 truncate">u/{user.username}</div>
                        <div className="text-xs text-muted-foreground">User • {user.followerCount} followers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
