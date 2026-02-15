// client/src/components/SearchBar/SearchBar.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  ArrowRight,
  MessageSquare,
  Hash,
  User as UserIcon,
  TrendingUp,
} from "lucide-react";

import {
  useSearchQuery,
  useGetSearchSuggestionsQuery,
} from "@/app/api/searchApi";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SearchBar = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearch = useDebounce(searchQuery, 200);

  const {
    data: searchResults,
    isLoading: isSearching,
    isFetching,
  } = useSearchQuery(
    { q: debouncedSearch, type: "all", limit: 10 },
    { skip: !debouncedSearch || debouncedSearch.length < 2 },
  );

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsExpanded(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsExpanded(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (item) => {
    if (item.type === "post") {
      navigate(`/posts/${item.data._id}`);
    } else if (item.type === "community") {
      navigate(`/community/${item.data._id}`);
    } else if (item.type === "user") {
      navigate(`/user/${item.data._id}`);
    }
    setIsExpanded(false);
    setSearchQuery("");
  };

  const results = searchResults?.results || {};
  const hasResults =
    (results.posts?.length || 0) +
      (results.communities?.length || 0) +
      (results.users?.length || 0) >
    0;
  const totalResults = searchResults?.metadata?.resultCounts?.total || 0;

  return (
    <div ref={searchBarRef} className="relative">
      <div
        className={cn(
          "relative flex items-center h-9 transition-all duration-200 rounded-md border",
          isExpanded
            ? "w-[280px] md:w-[400px] bg-background border-primary"
            : "w-[180px] md:w-[240px] bg-muted/40 border-transparent",
        )}
      >
        <div className="pl-3">
          {isFetching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search..."
          className="flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground/60 font-medium"
        />

        <div className="pr-2 flex items-center">
          {searchQuery && (
            <button
              className="p-1 hover:bg-muted rounded-sm transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          {!isExpanded && (
            <kbd className="hidden md:inline-flex h-4 items-center gap-1 rounded bg-muted px-1 font-mono text-[9px] text-muted-foreground">
              <span>⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full mt-1.5 w-full overflow-hidden rounded-md border bg-popover shadow-md"
          >
            <div className="max-h-[360px] overflow-y-auto p-1.5">
              {isSearching && debouncedSearch && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
                </div>
              )}

              {!isSearching && hasResults && (
                <div className="space-y-3">
                  {results.posts?.length > 0 && (
                    <div>
                      <header className="px-2 py-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Posts
                        </span>
                      </header>
                      {results.posts.slice(0, 4).map((post) => (
                        <button
                          key={post._id}
                          onClick={() =>
                            handleResultClick({ type: "post", data: post })
                          }
                          className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left hover:bg-muted transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">
                              {post.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              d/{post.community?.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.communities?.length > 0 && (
                    <div>
                      <header className="px-2 py-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Communities
                        </span>
                      </header>
                      {results.communities.slice(0, 3).map((community) => (
                        <button
                          key={community._id}
                          onClick={() =>
                            handleResultClick({
                              type: "community",
                              data: community,
                            })
                          }
                          className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left hover:bg-muted transition-colors"
                        >
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">
                              d/{community.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {community.memberCount} members
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isSearching && debouncedSearch && !hasResults && (
                <div className="py-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    No matches for "{debouncedSearch}"
                  </p>
                </div>
              )}

              {!debouncedSearch && (
                <div className="space-y-1">
                  <header className="px-2 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      Trending
                    </span>
                  </header>
                  {["React", "Vite", "Tailwind", "NodeJS"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                    >
                      <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/40" />
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <footer className="border-t bg-muted/30 px-3 py-1.5 flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight italic opacity-40">
                Discussly Search
              </span>
              <div className="flex gap-2">
                <kbd className="bg-background border rounded px-1 text-[8px] text-muted-foreground">
                  ↑↓
                </kbd>
                <kbd className="bg-background border rounded px-1 text-[8px] text-muted-foreground">
                  ↵
                </kbd>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
