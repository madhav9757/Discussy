import React from 'react';
import { useGetPostsQuery } from '../app/api/postsApi';
import { Loader2, TrendingUp, MessageSquare, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { CreatePostModal } from '../components/modals/CreatePostModal';
import PostCard from '../components/PostCard';

const Home = () => {
  const { data: posts, isLoading, isError } = useGetPostsQuery();

  return (
    <div className="max-w-5xl mx-auto flex gap-8">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            Active Feed
          </h1>
          <CreatePostModal>
            <Button className="h-10 text-sm px-5 rounded-full font-medium shadow-sm">
              New Post
            </Button>
          </CreatePostModal>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
          </div>
        )}

        {isError && (
          <div className="text-sm text-destructive border border-destructive/20 bg-destructive/10 p-4 rounded-xl">
            Could not load feed. Please try again later.
          </div>
        )}

        <div className="space-y-4">
          {!isLoading && (!posts || posts.length === 0) && (
            <div className="py-20 text-center text-sm text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/50">
              No posts found. Be the first to start a discussion!
            </div>
          )}

          {posts?.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      <aside className="hidden lg:block w-[300px] shrink-0 space-y-6 pt-2">
        <div className="border border-border/60 rounded-2xl bg-card p-5 space-y-5">
          <h3 className="font-semibold tracking-tight.text-foreground/90">System Pulse</h3>
          <ul className="space-y-3.5 text-sm text-muted-foreground">
            <li className="flex justify-between items-center group">
              <span className="group-hover:text-foreground transition-colors cursor-pointer">System Status</span> 
              <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                All Systems Normal
              </div>
            </li>
            <li className="flex justify-between items-center group">
              <span className="group-hover:text-foreground transition-colors cursor-pointer">Online Users</span> 
              <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-md text-foreground/80">1,024</span>
            </li>
          </ul>
        </div>
        
        <div className="border border-border/60 rounded-2xl bg-linear-to-br from-primary/5 to-primary/10 p-5 space-y-3 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
           <h3 className="font-bold text-foreground">Trending Communities</h3>
           <p className="text-sm text-muted-foreground relative z-10">Discover new places to discuss your favorite topics.</p>
           <Button variant="outline" className="w-full mt-2 rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors relative z-10">Explore Now</Button>
        </div>
      </aside>
    </div>
  );
};

export default Home;
