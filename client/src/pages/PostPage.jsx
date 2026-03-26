import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPostByIdQuery } from "../app/api/postsApi";
import PostCard from "../components/PostCard";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// lucide icons
import { Loader2, ArrowLeft, Clock, MessageSquareX } from "lucide-react";

const PostPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useGetPostByIdQuery(idOrSlug);

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-background flex flex-col font-sans overflow-hidden">
        <header className="shrink-0 px-6 py-4 border-b bg-background flex items-center z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading discussion...
          </p>
        </div>
      </div>
    );
  }

  // ── Error / Not Found State ──
  if (isError || !post) {
    return (
      <div className="w-full h-screen bg-background flex flex-col font-sans overflow-hidden">
        <header className="shrink-0 px-6 py-4 border-b bg-background flex items-center z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <MessageSquareX className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground">
            Discussion Not Found
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            This post may have been removed by the author or the link is
            incorrect.
          </p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="shadow-none"
          >
            Return to Feed
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Render ──
  return (
    <div className="w-full h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* ── Fixed Header ── */}
      <header className="shrink-0 px-6 py-4 border-b bg-background flex items-center justify-between z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {(post.content?.length || 0) < 500 ? "1 min read" : "3 min read"}
        </div>
      </header>

      {/* ── Scrollable Content Area ── */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto w-full p-6 md:p-8">
          <PostCard
            post={post}
            initialShowComments={true}
            isStandalone={true} // Optional flag if your PostCard behaves differently on its own page
          />

          {/* Thread End marker */}
          <div className="py-16 flex flex-col items-center justify-center opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mb-3" />
            <p className="text-xs font-medium text-muted-foreground">
              End of discussion
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PostPage;
