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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CreateCommunityModal } from "../components/modals/CreateCommunityModal";
import { cn } from "@/lib/utils";

/* ── Skeleton card ── */
const CommunitySkeleton = ({ grid }) =>
  grid ? (
    <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  ) : (
    <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
      <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36 rounded" />
        <Skeleton className="h-2.5 w-24 rounded" />
      </div>
      <Skeleton className="h-8 w-20 rounded-xl" />
    </div>
  );

/* ── Community grid card ── */
const CommunityGridCard = ({ community, onClick }) => (
  <div
    onClick={onClick}
    className="group relative bg-card border border-border/50 hover:border-primary/30 rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden"
  >
    {/* Subtle top gradient accent */}
    <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl bg-muted border border-border/40 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center p-0.5">
        <img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}&backgroundColor=transparent`}
          alt={community.name}
          className="w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <h3 className="text-[13.5px] font-bold text-foreground group-hover:text-primary transition-colors truncate">
          c/{community.name}
        </h3>
        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground font-medium">
          <Users size={10} strokeWidth={2.5} />
          {(community.members?.length || 0).toLocaleString()} members
        </div>
      </div>
      <ChevronRight
        size={14}
        className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0"
      />
    </div>

    <p className="text-[12px] text-muted-foreground/80 leading-relaxed line-clamp-2 flex-1">
      {community.description || "Join the discussion and connect with others."}
    </p>

    <div className="flex items-center gap-2 flex-wrap mt-auto">
      {community.category && (
        <Badge
          variant="secondary"
          className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
        >
          {community.category}
        </Badge>
      )}
      {community.isNew && (
        <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          <Sparkles size={9} /> New
        </Badge>
      )}
      {(community.members?.length || 0) > 500 && (
        <Badge
          variant="outline"
          className="text-[10px] font-bold px-2 py-0.5 rounded-full gap-1 border-orange-300/40 text-orange-500"
        >
          <Flame size={9} /> Hot
        </Badge>
      )}
    </div>
  </div>
);

/* ── Community list row ── */
const CommunityListRow = ({ community, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-card border border-border/50 hover:border-primary/30 rounded-2xl px-4 py-3.5 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-sm"
  >
    <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 overflow-hidden shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center p-0.5">
      <img
        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}&backgroundColor=transparent`}
        alt={community.name}
        className="w-full h-full"
      />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13.5px] font-bold text-foreground group-hover:text-primary transition-colors">
          c/{community.name}
        </span>
        {community.category && (
          <Badge
            variant="secondary"
            className="text-[10px] font-bold px-2 py-0 rounded-full capitalize hidden sm:flex"
          >
            {community.category}
          </Badge>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground/70 truncate mt-0.5">
        {community.description || "Join the discussion."}
      </p>
    </div>

    <div className="flex items-center gap-3 shrink-0">
      <div className="hidden sm:flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
        <Users size={12} strokeWidth={2} />
        {(community.members?.length || 0).toLocaleString()}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="h-8 px-3 rounded-xl text-[12px] font-semibold gap-1.5 pointer-events-none group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
      >
        <Plus size={11} strokeWidth={2.5} /> Join
      </Button>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════ */
const Communities = () => {
  const { data: communities, isLoading } = useGetCommunitiesQuery();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [activeFilter, setActiveFilter] = useState("all");

  /* ── Derived categories ── */
  const categories = useMemo(() => {
    if (!communities) return [];
    const cats = [
      ...new Set(communities.map((c) => c.category).filter(Boolean)),
    ];
    return cats.slice(0, 6);
  }, [communities]);

  /* ── Filtered list ── */
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
        .slice(0, 3),
    [communities],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16 space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Hash size={22} strokeWidth={2.5} className="text-primary" />
            Communities
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Discover and join communities that interest you
          </p>
        </div>
        <CreateCommunityModal>
          <Button className="h-9 px-4 rounded-xl text-[13px] font-bold gap-2 shadow-sm">
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </CreateCommunityModal>
      </div>

      {/* ── Search + view toggle bar ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search communities…"
            className="pl-9 h-10 rounded-xl border-border/50 bg-card text-[13px] font-medium placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
        {/* View mode toggle */}
        <div className="flex items-center bg-card border border-border/50 rounded-xl p-1 gap-0.5 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === "grid"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <LayoutGrid size={15} strokeWidth={2} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === "list"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <List size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Category filter pills ── */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all capitalize border",
                activeFilter === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {cat === "all" ? (
                <span className="flex items-center gap-1">
                  <Globe size={11} /> All
                </span>
              ) : (
                cat
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {/* ════ Main grid/list ════ */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Results count */}
          {!isLoading && communities?.length > 0 && (
            <p className="text-[12px] text-muted-foreground font-medium px-0.5">
              {filtered.length}{" "}
              {filtered.length === 1 ? "community" : "communities"}
              {query && (
                <span>
                  {" "}
                  for "
                  <span className="text-foreground font-semibold">{query}</span>
                  "
                </span>
              )}
            </p>
          )}

          {/* Loading */}
          {isLoading &&
            (viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CommunitySkeleton key={i} grid />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CommunitySkeleton key={i} grid={false} />
                ))}
              </div>
            ))}

          {/* Grid view */}
          {!isLoading && viewMode === "grid" && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((community) => (
                <CommunityGridCard
                  key={community._id}
                  community={community}
                  onClick={() => navigate(`/communities/${community._id}`)}
                />
              ))}
            </div>
          )}

          {/* List view */}
          {!isLoading && viewMode === "list" && filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((community) => (
                <CommunityListRow
                  key={community._id}
                  community={community}
                  onClick={() => navigate(`/communities/${community._id}`)}
                />
              ))}
            </div>
          )}

          {/* Empty — no results */}
          {!isLoading && filtered.length === 0 && communities?.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-16 bg-card border border-dashed border-border/60 rounded-2xl text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground/70">
                  No results
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search or category.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl text-xs font-semibold"
                onClick={() => {
                  setQuery("");
                  setActiveFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Empty — no communities at all */}
          {!isLoading && (!communities || communities.length === 0) && (
            <div className="flex flex-col items-center gap-4 py-16 bg-card border border-dashed border-border/60 rounded-2xl text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
                <Hash className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground/70">
                  No communities yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to create one!
                </p>
              </div>
              <CreateCommunityModal>
                <Button
                  size="sm"
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <Plus size={12} strokeWidth={2.5} /> Start a Community
                </Button>
              </CreateCommunityModal>
            </div>
          )}
        </div>

        {/* ════ Sidebar ════ */}
        {!isLoading && communities?.length > 0 && (
          <aside className="hidden xl:flex flex-col gap-4 w-[220px] shrink-0">
            {/* Top communities */}
            <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Most Popular
                </h3>
                <TrendingUp size={12} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                {topCommunities.map((c, i) => (
                  <button
                    key={c._id}
                    onClick={() => navigate(`/communities/${c._id}`)}
                    className="group w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-accent transition-all"
                  >
                    <span className="text-[11px] font-black text-muted-foreground/30 w-3 shrink-0">
                      {i + 1}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-muted border border-border/40 overflow-hidden shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${c.name}&backgroundColor=transparent`}
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[12px] font-bold text-foreground/90 truncate group-hover:text-primary transition-colors">
                        c/{c.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                        <Users size={9} />{" "}
                        {(c.members?.length || 0).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-card border border-border/50 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Overview
              </h3>
              {[
                {
                  label: "Total communities",
                  value: communities.length,
                  Icon: Hash,
                  color: "text-primary",
                },
                {
                  label: "Total members",
                  value: communities
                    .reduce((s, c) => s + (c.members?.length || 0), 0)
                    .toLocaleString(),
                  Icon: Users,
                  color: "text-blue-400",
                },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground font-medium">
                    <Icon size={12} className={color} strokeWidth={2} />
                    {label}
                  </div>
                  <span className={cn("text-[12.5px] font-black", color)}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Create CTA */}
            <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
              <p className="text-[13px] font-bold text-foreground/90 leading-snug">
                Start your own community
              </p>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                Bring people together around a topic you love.
              </p>
              <CreateCommunityModal>
                <Button
                  size="sm"
                  className="w-full h-8 rounded-xl text-[12px] font-bold gap-1.5"
                >
                  <Plus size={11} strokeWidth={2.5} /> Create Community
                </Button>
              </CreateCommunityModal>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Communities;
