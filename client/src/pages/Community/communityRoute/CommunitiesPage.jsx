import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Flame, Plus, Globe, 
  Users, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

import { useGetCommunitiesQuery } from '@/app/api/communitiesApi';
import CommunityCard from '@/components/communitycard/CommunityCard';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

const CommunitiesPage = () => {
  const navigate = useNavigate();
  const { data: communities = [], isLoading } = useGetCommunitiesQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('membersDesc');
  const [minMembers, setMinMembers] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm.toLowerCase()), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const uniqueCategories = useMemo(() => 
    [...new Set(communities.map(c => c.category))].filter(Boolean)
  , [communities]);

  const trendingCommunities = useMemo(() => 
    [...communities].sort((a, b) => b.members.length - a.members.length).slice(0, 5)
  , [communities]);

  const filteredCommunities = useMemo(() => {
    let filtered = communities.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(debouncedSearch) || 
                            c.description?.toLowerCase().includes(debouncedSearch);
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      const matchesMinMembers = !minMembers || (c.members?.length || 0) >= parseInt(minMembers);

      return matchesSearch && matchesCategory && matchesMinMembers;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'membersDesc') return (b.members?.length || 0) - (a.members?.length || 0);
      if (sortOrder === 'createdAtDesc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [communities, debouncedSearch, categoryFilter, minMembers, sortOrder]);

  if (isLoading) return <CommunitiesSkeleton />;

  return (
    <div className="container max-w-6xl py-8 lg:py-12 space-y-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Globe className="h-5 w-5 fill-primary/10" />
            <span className="text-sm font-semibold uppercase tracking-wider">Ecosystem</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">Join specialized hubs to refine your feed.</p>
        </div>
        <Button onClick={() => navigate('/create-community')} className="rounded-md">
          <Plus className="mr-2 h-4 w-4" /> Create Community
        </Button>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search hubs..." 
            className="pl-10 h-11 bg-muted/40 border-border/50 focus-visible:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px] h-11 bg-muted/20 border-border/50">
              <ArrowUpDown className="h-3.5 w-3.5 mr-2 opacity-50" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="membersDesc">Top Members</SelectItem>
              <SelectItem value="createdAtDesc">Newest</SelectItem>
              <SelectItem value="nameAsc">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 px-4 gap-2 border-border/50 hover:bg-muted/50">
                <SlidersHorizontal className="h-4 w-4 opacity-70" />
                Filters
                {(categoryFilter !== 'all' || minMembers) && (
                  <Badge className="ml-1 px-1 min-w-[1.2rem] h-5 rounded-full flex items-center justify-center">1</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>Filter Communities</SheetTitle>
              </SheetHeader>
              <div className="flex-1 space-y-8 py-8">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">Category</h4>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Minimum Members</h4>
                  <Input 
                    type="number" 
                    value={minMembers} 
                    onChange={(e) => setMinMembers(e.target.value)} 
                    placeholder="0" 
                    className="focus-visible:ring-primary/20"
                  />
                </div>
              </div>
              <SheetFooter className="flex-col gap-2 border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20" 
                  onClick={() => {
                    setCategoryFilter('all');
                    setMinMembers('');
                  }}
                >
                  Clear All
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Trending Horizontal Scroll */}
      {!searchTerm && !minMembers && categoryFilter === 'all' && (
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Flame className="h-5 w-5 text-orange-500 fill-orange-500/10" />
            Trending Right Now
          </div>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {trendingCommunities.map((c, idx) => (
                <Card 
                  key={c._id} 
                  className="w-[260px] border-border/40 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => navigate(`/community/${c._id}`)}
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                        {c.icon || '🎯'}
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-muted-foreground/20">#{idx + 1}</Badge>
                    </div>
                    <div>
                      <h3 className="font-bold text-base group-hover:text-primary truncate transition-colors">r/{c.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <Users className="h-3 w-3" /> {c.members?.length || 0}
                        </span>
                        <Separator orientation="vertical" className="h-3" />
                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tighter">
                          {c.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>
      )}

      {/* Main Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Hub Directory</h2>
          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            {filteredCommunities.length} results
          </span>
        </div>

        {filteredCommunities.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCommunities.map((c) => (
              <motion.div key={c._id} variants={itemVariants}>
                <CommunityCard community={c} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed bg-muted/10">
            <div className="p-4 bg-background border rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold">No communities matched</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
              Adjust your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSearchTerm('')} className="mt-6">
              Clear Search
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

const CommunitiesSkeleton = () => (
  <div className="container max-w-6xl py-12 space-y-12">
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-full max-w-sm" />
    </div>
    <div className="flex gap-4">
      <Skeleton className="h-12 flex-1" />
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-12 w-32" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  </div>
);

export default CommunitiesPage;