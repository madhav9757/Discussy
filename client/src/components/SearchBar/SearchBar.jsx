import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Command, ArrowRight, History, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SearchBar = ({ searchQuery, onSearchChange }) => {
  const searchInputRef = useRef(null);
  const searchBarRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggestions = [
    { text: 'React Hooks Patterns', icon: Sparkles },
    { text: 'AI in Web Dev 2026', icon: History },
    { text: 'Discussly Community Guidelines', icon: History },
  ];

  // Handle Command + K shortcut
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsExpanded(true);
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchResults = useCallback(async (query) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      // Simulate high-fidelity search delay
      await new Promise(resolve => setTimeout(resolve, 350));
      const dummyResults = [
        { id: 1, title: `Optimizing React for 2026`, category: 'Tech', type: 'Post' },
        { id: 2, title: `The AI Ethics Debate`, category: 'Philosophy', type: 'Community' },
      ];
      setSearchResults(dummyResults);
    } catch (err) {
      setError("Search failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchResults(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  return (
    <div ref={searchBarRef} className="relative z-50">
      <div 
        className={cn(
          "relative flex items-center h-10 transition-all duration-300 rounded-xl border bg-muted/40",
          isExpanded ? "w-[300px] md:w-[420px] bg-background ring-2 ring-primary/20 border-primary/50 shadow-lg" : "w-[240px] border-transparent hover:bg-muted/60"
        )}
      >
        <div className="pl-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Search className={cn("h-4 w-4 transition-colors", isExpanded ? "text-primary" : "text-muted-foreground")} />
          )}
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search Discussly..."
          className="flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground/70"
        />

        <div className="pr-2 flex items-center gap-1.5">
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-muted rounded-md"
              onClick={() => { onSearchChange(''); searchInputRef.current?.focus(); }}
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
            <div className="max-h-[420px] overflow-y-auto p-2 scrollbar-hide">
              {/* Results Section */}
              {searchResults.length > 0 && searchQuery && (
                <div className="mb-4">
                  <header className="px-3 py-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Top Results</span>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold opacity-50">Global Search</Badge>
                  </header>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-primary/5 active:scale-[0.98]"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {result.type[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{result.title}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{result.category} • {result.type}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions Section */}
              <div className="space-y-1">
                <header className="px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {searchQuery ? "Suggested Queries" : "Recent & Popular"}
                  </span>
                </header>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSearchChange(item.text)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-all hover:bg-accent hover:text-primary active:bg-accent/80"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground/50" />
                    <span className="flex-1 text-left truncate">{item.text}</span>
                    <Command className="h-3 w-3 text-muted-foreground/30" />
                  </button>
                ))}
              </div>

              {/* Empty State */}
              {searchQuery && !isLoading && searchResults.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                    <Search className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No matches for "{searchQuery}"</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">Try checking for typos or broader terms</p>
                </div>
              )}
            </div>

            {/* Footer Hints */}
            <footer className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/50">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-background border rounded px-1">↑↓</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="bg-background border rounded px-1">esc</kbd> Close</span>
              </div>
              <span className="text-primary/40 font-black">Discussly Search Engine v2.0</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;