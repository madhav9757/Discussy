// client/src/components/SearchBar/SearchBar.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Loader2, Command, ArrowRight, 
  MessageSquare, Hash, User as UserIcon, TrendingUp 
} from 'lucide-react';

import { useSearchQuery, useGetSearchSuggestionsQuery } from '@/app/api/searchApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SearchBar = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch search results
  const { 
    data: searchResults, 
    isLoading: isSearching,
    isFetching 
  } = useSearchQuery(
    { q: debouncedSearch, type: 'all', limit: 15 },
    { skip: !debouncedSearch || debouncedSearch.length < 2 }
  );

  // Fetch autocomplete suggestions
  const { data: suggestions } = useGetSearchSuggestionsQuery(
    debouncedSearch,
    { skip: !debouncedSearch || debouncedSearch.length < 2 }
  );

  // Handle Command + K shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsExpanded(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsExpanded(false);
        setSearchQuery('');
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (e) => {
      const results = searchResults?.results || {};
      const allResults = [
        ...(results.posts || []).map(p => ({ type: 'post', data: p })),
        ...(results.communities || []).map(c => ({ type: 'community', data: c })),
        ...(results.users || []).map(u => ({ type: 'user', data: u })),
      ];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        handleResultClick(selected);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, searchResults, selectedIndex]);

  const handleResultClick = (item) => {
    if (item.type === 'post') {
      navigate(`/posts/${item.data._id}`);
    } else if (item.type === 'community') {
      navigate(`/community/${item.data._id}`);
    } else if (item.type === 'user') {
      navigate(`/user/${item.data._id}`);
    }
    setIsExpanded(false);
    setSearchQuery('');
  };

  const handleViewAll = () => {
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsExpanded(false);
  };

  const getResultIcon = (type) => {
    const icons = {
      post: MessageSquare,
      community: Hash,
      user: UserIcon,
    };
    return icons[type] || MessageSquare;
  };

  const results = searchResults?.results || {};
  const hasResults = (results.posts?.length || 0) + (results.communities?.length || 0) + (results.users?.length || 0) > 0;
  const totalResults = searchResults?.metadata?.resultCounts?.total || 0;

  return (
    <div ref={searchBarRef} className="relative z-50">
      <div 
        className={cn(
          "relative flex items-center h-10 transition-all duration-300 rounded-xl border bg-muted/40",
          isExpanded 
            ? "w-[300px] md:w-[500px] bg-background ring-2 ring-primary/20 border-primary/50 shadow-lg" 
            : "w-[240px] border-transparent hover:bg-muted/60"
        )}
      >
        <div className="pl-3 pointer-events-none">
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className={cn(
              "h-4 w-4 transition-colors", 
              isExpanded ? "text-primary" : "text-muted-foreground"
            )} />
          )}
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search posts, communities, users..."
          className="flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground/70"
        />

        <div className="pr-2 flex items-center gap-1.5">
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-muted rounded-md"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {!isExpanded && (
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-bold text-muted-foreground shadow-sm">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="absolute top-full mt-2 w-full overflow-hidden rounded-2xl border bg-popover/95 backdrop-blur-xl shadow-2xl"
          >
            <div className="max-h-[500px] overflow-y-auto p-2 scrollbar-hide">
              {/* Loading State */}
              {isSearching && debouncedSearch && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {/* Results */}
              {!isSearching && hasResults && (
                <div className="space-y-4">
                  {/* Posts */}
                  {results.posts?.length > 0 && (
                    <div>
                      <header className="px-3 py-2 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Posts ({results.posts.length})
                        </span>
                      </header>
                      {results.posts.slice(0, 5).map((post, idx) => (
                        <button
                          key={post._id}
                          onClick={() => handleResultClick({ type: 'post', data: post })}
                          className={cn(
                            "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-primary/5 active:scale-[0.98]",
                            selectedIndex === idx && "bg-primary/5"
                          )}
                        >
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {post.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground font-medium">
                                r/{post.community?.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <span className="text-[10px] text-muted-foreground">
                                {post.score} points
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Communities */}
                  {results.communities?.length > 0 && (
                    <div>
                      <header className="px-3 py-2 flex items-center gap-2">
                        <Hash className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Communities ({results.communities.length})
                        </span>
                      </header>
                      {results.communities.slice(0, 3).map((community) => (
                        <button
                          key={community._id}
                          onClick={() => handleResultClick({ type: 'community', data: community })}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-primary/5 active:scale-[0.98]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Hash className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              r/{community.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {community.memberCount} members
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Users */}
                  {results.users?.length > 0 && (
                    <div>
                      <header className="px-3 py-2 flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Users ({results.users.length})
                        </span>
                      </header>
                      {results.users.slice(0, 3).map((user) => (
                        <button
                          key={user._id}
                          onClick={() => handleResultClick({ type: 'user', data: user })}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-primary/5 active:scale-[0.98]"
                        >
                          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              u/{user.username}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {user.bio || 'No bio'}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* View All Button */}
                  {totalResults > 10 && (
                    <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between font-semibold"
                        onClick={handleViewAll}
                      >
                        <span>View all {totalResults} results</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No Results */}
              {!isSearching && debouncedSearch && !hasResults && (
                <div className="py-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                    <Search className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No results for "{debouncedSearch}"
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}

              {/* Trending Suggestions (when no search) */}
              {!debouncedSearch && (
                <div className="space-y-1">
                  <header className="px-3 py-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Trending Searches
                    </span>
                  </header>
                  {['React Hooks', 'Web3 Development', 'Machine Learning', 'TypeScript'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-all hover:bg-accent hover:text-primary active:bg-accent/80"
                    >
                      <TrendingUp className="h-4 w-4 text-orange-500/60" />
                      <span className="flex-1 text-left">{term}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/50">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border rounded px-1">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border rounded px-1">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border rounded px-1">esc</kbd> Close
                </span>
              </div>
              <span className="text-primary/40 font-black">⚡ Powered by Discussly</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;