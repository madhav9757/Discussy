import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPostByIdQuery } from "../app/api/postsApi";
import PostCard from "../components/PostCard";
import { Loader2, ArrowLeft, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";

const PostPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useGetPostByIdQuery(idOrSlug);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50 animate-pulse">
          Loading post...
        </p>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-40 gap-6 px-4 text-center">
        <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-3xl max-w-md">
          <p className="text-destructive font-black text-lg">Post Not Found</p>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            This discussion might have been removed or the link is incorrect.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/")} 
          variant="outline" 
          className="rounded-xl px-8 font-bold gap-2"
        >
          <ArrowLeft size={16} /> Back to Feed
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-8 pb-32">
        <div className="max-w-[1000px] mx-auto space-y-8">
          {/* Navigation & Context */}
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Go Back
            </button>
            <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/40">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {(post.content?.length || 0) < 500 ? "1 min read" : "3 min read"}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500/60 uppercase tracking-tighter">
                <ShieldCheck size={12} /> Verified Hub
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            <PostCard post={post} initialShowComments={true} />
            
            {/* Thread End marker */}
            <div className="flex flex-col items-center justify-center pt-20 pb-10 opacity-20 hover:opacity-100 transition-opacity">
               <div className="h-[2px] w-20 bg-muted-foreground/20 rounded-full mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">End of Discussion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
