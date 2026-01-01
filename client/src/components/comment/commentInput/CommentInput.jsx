import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateCommentMutation, useGetCommentsByPostIdQuery } from '@/app/api/commentsApi';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CommentInput = ({ postId, parentId = null }) => {
  const [content, setContent] = useState('');
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const { data: comments = [] } = useGetCommentsByPostIdQuery(postId);
  const user = useSelector((state) => state.auth.userInfo);

  // Check if user has already commented (only for top-level comments)
  const hasAlreadyCommented = !parentId && comments.some(
    (comment) => comment.createdBy?._id === user?._id && !comment.parentId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createComment({ postId, content, parentId }).unwrap();
      setContent('');
      toast.success(parentId ? "Reply posted!" : "Comment added!");
    } catch (error) {
      toast.error("Failed to post. Please try again.");
      console.error('Comment Error:', error);
    }
  };

  if (hasAlreadyCommented) {
    return (
      <Alert className="bg-muted/50 border-dashed py-3">
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-sm text-muted-foreground flex items-center gap-2">
          You've shared your thoughts here already. Use replies to continue the conversation.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex gap-4 group">
      <Avatar className="h-9 w-9 hidden sm:flex border">
        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.username}`} />
        <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <form className="flex-1 space-y-3" onSubmit={handleSubmit}>
        <div className="relative">
          <Textarea
            className="min-h-[100px] resize-none bg-muted/20 border-border/60 focus-visible:ring-primary/20 transition-all rounded-xl p-4 text-sm leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentId ? "Write a helpful reply..." : "What are your thoughts?"}
            disabled={isLoading}
          />
          {!content && !parentId && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest pointer-events-none">
              <Sparkles className="h-3 w-3" /> Markdown Supported
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {content.length > 0 && `${content.length} characters`}
          </p>
          
          <div className="flex gap-2">
            {parentId && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setContent('')}
                disabled={isLoading}
              >
                Clear
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !content.trim()}
              className="rounded-full px-5 shadow-sm"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Posting
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  {parentId ? 'Reply' : 'Post Comment'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentInput;