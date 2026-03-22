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
    <div className="max-w-4xl mx-auto space-y-5 px-4 pb-12">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground/40 group-focus-within:text-primary transition-colors">
          <SearchIcon className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <Input
          className="pl-10 h-11 text-sm rounded-xl border-border/30 bg-card/50 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 shadow-xs placeholder:text-muted-foreground/40 transition-all duration-200 font-medium"
          placeholder="Search communities, users, or posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="min-h-[300px] border border-border/30 bg-card rounded-2xl overflow-hidden shadow-xs flex flex-col relative">
        {debouncedSearchTerm.length < 2 && (
          <div className="m-auto text-xs text-muted-foreground/50 flex flex-col items-center gap-3 py-12">
            <SearchIcon className="w-8 h-8 opacity-10" />
            <p className="font-bold tracking-tight uppercase">Ready to search</p>
          </div>
        )}

        {isLoading && debouncedSearchTerm.length >= 2 && (
          <div className="flex p-6 items-center justify-center flex-1">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
            <span className="ml-3 text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Processing...
            </span>
          </div>
        )}

        {isError && (
          <div className="p-4 text-xs font-bold text-destructive bg-destructive/5 m-4 rounded-xl border border-destructive/10 text-center uppercase tracking-widest">
            Search Error
          </div>
        )}

        {data && data.results && Object.values(data.results).flat().length === 0 && (
          <div className="m-auto text-xs text-muted-foreground/50 flex flex-col items-center gap-3 py-12">
            <span className="text-3xl font-black opacity-10">0</span>
            <p className="font-bold uppercase tracking-widest">No results found</p>
          </div>
        )}

        {data && data.results && (
          <div className="flex-1 overflow-hidden flex flex-col p-3 space-y-6">
            {/* Posts section */}
            {data.results.posts?.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1 h-3 bg-primary/40 rounded-full" />
                   <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Discussions</h3>
                </div>
                {data.results.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}

            {/* Communities & Users List */}
            {(data.results.communities?.length > 0 || data.results.users?.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                   <div className="w-1 h-3 bg-indigo-500/40 rounded-full" />
                   <h3 className="text-[10px] font-black tracking-widest text-muted-foreground/60 uppercase">Profiles & Hubs</h3>
                </div>
                <div className="divide-y divide-border/20 bg-muted/5 rounded-xl border border-border/20 overflow-hidden">
                  {data.results.communities?.map((community) => (
                    <div
                      key={community._id}
                      onClick={() => navigate(`/communities/${community._id}`)}
                      className="p-3 hover:bg-muted/10 cursor-pointer flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary/60 flex items-center justify-center shrink-0 border border-primary/10">
                         <Hash size={14} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-foreground/80 truncate group-hover:text-primary transition-colors">c/{community.name}</div>
                        <div className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-tighter">Community • {community.memberCount} members</div>
                      </div>
                    </div>
                  ))}

                  {data.results.users?.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className="p-3 hover:bg-muted/10 cursor-pointer flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted border border-border/20 overflow-hidden shrink-0 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`} alt="" className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-foreground/80 truncate group-hover:text-primary transition-colors">u/{user.username}</div>
                        <div className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-tighter">User • {user.followerCount} followers</div>
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
