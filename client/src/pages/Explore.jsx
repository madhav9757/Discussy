import React from 'react';
import { Compass, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

const Explore = () => {
  return (
    <div className="max-w-5xl mx-auto flex gap-8">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Compass size={24} className="text-primary" />
            Explore
          </h1>
        </div>

        <div className="border border-border/60 bg-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-muted/20 border-b border-border/50 text-sm font-semibold text-foreground/80">
            Trending Topics
          </div>
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <Sparkles className="w-12 h-12 text-primary/40 animate-pulse mb-2" />
            <h3 className="text-xl font-bold tracking-tight">Gathering Insights</h3>
            <p className="text-[15px] text-muted-foreground/80 max-w-sm">
              We are currently analyzing the latest trends and discussions. Please check back later.
            </p>
          </div>
        </div>
      </div>

      <aside className="w-[300px] shrink-0 space-y-6 pt-2 hidden md:block">
        <div className="border border-border/60 bg-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-muted/20 border-b border-border/50 text-sm font-semibold flex items-center gap-2 text-foreground/80">
            <AlertCircle size={16} className="text-primary" /> Popular Tags
          </div>
          <div className="divide-y divide-border/40">
            {['#technology', '#design', '#webdev', '#news', '#react'].map((topic, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/40 cursor-pointer transition-colors">
                <span className="text-sm font-medium text-foreground">{topic}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">{(Math.random() * 10).toFixed(1)}k posts</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Explore;
