import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCommunitiesQuery } from "../app/api/communitiesApi";
import {
  Users,
  Hash,
  Search,
  Plus,
  TrendingUp,
  ChevronRight,
  Flame,
  Sparkles,
  Globe,
  LayoutGrid,
  List,
  Compass,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CreateCommunityModal } from "../components/modals/CreateCommunityModal";
import { cn, getCommunityIconUrl } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ── Minimal Skeleton ── */
const CommunitySkeleton = ({ grid }) =>
  grid ? (
    <Card className="p-4 shadow-none">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="space-y-1.5 mb-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </Card>
  ) : (
    <Card className="p-3 shadow-none flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </Card>
  );

/* ── Grid Card ── */
const CommunityGridCard = ({ community, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    onClick={onClick}
    className="h-full"
  >
    <Card className="group h-full cursor-pointer hover:border-primary/40 transition-colors shadow-none flex flex-col">
      <CardContent className="p-4 flex flex-col h-full gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="w-10 h-10 border border-border/50">
              <AvatarImage
                src={getCommunityIconUrl(community)}
                alt={community.name}
                className="object-cover"
              />
              <AvatarFallback>
                {community.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                c/{community.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="text-xs">
                  {(community.members?.length || 0).toLocaleString()} members
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
          {community.description ||
            "Explore and connect with members in this growing community."}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap pt-1 mt-auto">
          {community.category && (
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0 rounded-sm font-medium"
            >
              <Hash className="w-3 h-3 mr-1 opacity-70" />
              {community.category}
            </Badge>
          )}
          {community.isNew && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 rounded-sm font-medium text-blue-500 border-blue-500/20 bg-blue-500/5"
            >
              <Sparkles className="w-3 h-3 mr-1" /> New
            </Badge>
          )}
          {(community.members?.length || 0) > 500 && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 rounded-sm font-medium text-orange-500 border-orange-500/20 bg-orange-500/5"
            >
              <Flame className="w-3 h-3 mr-1" /> Hot
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ── List Row ── */
const CommunityListRow = ({ community, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onClick}
  >
    <Card className="group cursor-pointer hover:border-primary/40 transition-colors shadow-none">
      <CardContent className="p-3 flex items-center gap-4">
        <Avatar className="w-10 h-10 border border-border/50">
          <AvatarImage
            src={getCommunityIconUrl(community)}
            className="object-cover"
          />
          <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                c/{community.name}
              </span>
              {community.category && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 rounded-sm font-medium hidden sm:inline-flex"
                >
                  {community.category}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {community.description || "Join this amazing community today."}
            </p>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground min-w-[100px] justify-end">
            <Users className="w-3.5 h-3.5" />
            <span>
              {(community.members?.length || 0).toLocaleString()} members
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="h-8 text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          Join
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

/* ════════════════════════════════════════════════════ */
const Communities = () => {
  const { data: communities, isLoading } = useGetCommunitiesQuery();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilter, setActiveFilter] = useState("all");

  const categories = useMemo(() => {
    if (!communities) return [];
    return [
      ...new Set(communities.map((c) => c.category).filter(Boolean)),
    ].slice(0, 8);
  }, [communities]);

  const filtered = useMemo(() => {
    if (!communities) return [];
    return communities.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ||
        c.category?.toLowerCase() === activeFilter.toLowerCase();
      return matchesQuery && matchesFilter;
    });
  }, [communities, query, activeFilter]);

  const topCommunities = useMemo(
    () =>
      [...(communities || [])]
        .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
        .slice(0, 5),
    [communities],
  );

  return (
    <div className="w-full h-[calc(100vh-69px)] bg-background flex flex-col font-sans overflow-hidden">
      {/* ── Header ── */}
      <header className="px-6 py-4 border-b bg-background sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-md text-foreground">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Communities
            </h1>
            <p className="text-xs text-muted-foreground">
              Discover and join spaces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 h-9 text-sm bg-muted/50 border-transparent hover:bg-muted focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-none"
            />
          </div>
          <CreateCommunityModal>
            <Button size="sm" className="h-9 gap-1.5 shadow-none">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </CreateCommunityModal>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-64 border-r bg-muted/10 overflow-hidden">
          <ScrollArea className="h-full py-6 px-4">
            <div className="space-y-6">
              {/* Categories */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-muted-foreground px-2">
                  Categories
                </h3>
                <nav className="space-y-1">
                  {["all", ...categories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={cn(
                        "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                        activeFilter === cat
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {cat === "all" ? (
                          <Globe className="w-4 h-4" />
                        ) : (
                          <Hash className="w-4 h-4 opacity-70" />
                        )}
                        <span className="capitalize">{cat}</span>
                      </div>
                      {activeFilter === cat && (
                        <ArrowRight className="w-3 h-3 opacity-70" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <Separator />

              {/* Trending */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <h3 className="text-xs font-medium">Trending</h3>
                </div>
                <div className="space-y-1">
                  {topCommunities.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => navigate(`/communities/${c.name}`)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group text-left"
                    >
                      <Avatar className="w-6 h-6 border border-border/50">
                        <AvatarImage
                          src={getCommunityIconUrl(c)}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-[10px]">
                          {c.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          c/{c.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {(c.members?.length || 0).toLocaleString()} members
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* ── Feed ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="px-6 py-3 border-b flex items-center justify-between bg-background z-10">
            <span className="text-sm text-muted-foreground">
              {!isLoading && (
                <>
                  Showing{" "}
                  <strong className="text-foreground font-medium">
                    {filtered.length}
                  </strong>{" "}
                  results
                </>
              )}
            </span>

            <div className="flex items-center bg-muted/50 p-0.5 rounded-md border">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-sm transition-colors",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-sm transition-colors",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 h-full px-6 py-4">
            <AnimatePresence mode="popLayout">
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "gap-4",
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col max-w-[90%] mx-auto w-full",
                  )}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CommunitySkeleton key={i} grid={viewMode === "grid"} />
                  ))}
                </motion.div>
              )}

              {!isLoading && filtered.length > 0 && (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "gap-4",
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col max-w-[90%] mx-auto w-full",
                  )}
                >
                  {filtered.map((community) =>
                    viewMode === "grid" ? (
                      <CommunityGridCard
                        key={community._id}
                        community={community}
                        onClick={() =>
                          navigate(`/communities/${community.name}`)
                        }
                      />
                    ) : (
                      <CommunityListRow
                        key={community._id}
                        community={community}
                        onClick={() =>
                          navigate(`/communities/${community.name}`)
                        }
                      />
                    ),
                  )}
                </motion.div>
              )}

              {!isLoading && filtered.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShieldAlert className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    No results found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    We couldn't find any communities matching your search or
                    active filters.
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      setActiveFilter("all");
                    }}
                    className="shadow-none"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default Communities;
