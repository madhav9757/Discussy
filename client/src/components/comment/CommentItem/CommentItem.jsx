import React, { useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  Pencil, 
  Reply, 
  Send, 
  MoreHorizontal,
  X,
  Check
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  useToggleCommentVoteMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useCreateCommentMutation,
} from "@/app/api/commentsApi";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const CommentItem = ({ comment, onRefresh }) => {
  const user = useSelector((state) => state.auth.userInfo);
  const isCurrentUser = user && String(comment.createdBy?._id) === String(user._id);

  const [vote] = useToggleCommentVoteMutation();
  const [delComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [createReply] = useCreateCommentMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const currentUserVote = comment.upvotes?.includes(user?._id)
    ? "upvote"
    : comment.downvotes?.includes(user?._id)
    ? "downvote"
    : null;

  const handleVote = async (type) => {
    if (!user) return toast.error("Please login to vote");
    try {
      await vote({ commentId: comment._id, type }).unwrap();
      onRefresh?.();
    } catch (err) {
      toast.error("Vote failed");
    }
  };

  const handleDelete = async () => {
    try {
      await delComment({ commentId: comment._id, postId: comment.postId }).unwrap();
      toast.success("Comment deleted");
      onRefresh?.();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment({
        commentId: comment._id,
        content: editContent,
        postId: comment.postId,
      }).unwrap();
      setIsEditing(false);
      toast.success("Comment updated");
      onRefresh?.();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    try {
      await createReply({
        postId: comment.postId,
        content: replyContent,
        parentId: comment._id,
      }).unwrap();
      setReplyContent("");
      setShowReplyBox(false);
      toast.success("Reply posted");
      onRefresh?.();
    } catch (err) {
      toast.error("Reply failed");
    }
  };

  return (
    <div className="group relative flex gap-4 py-4 px-2 rounded-lg transition-colors hover:bg-muted/30">
      {/* Thread Line for Nested Replies */}
      {comment.parentId && (
        <div className="absolute left-[-1.5rem] top-0 bottom-0 w-px bg-border group-hover:bg-primary/30" />
      )}

      <Avatar className="h-9 w-9 border">
        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.createdBy?.username}`} />
        <AvatarFallback>{comment.createdBy?.username?.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold hover:underline cursor-pointer">
              {comment.createdBy?.username || "Anonymous"}
            </span>
            {isCurrentUser && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-primary/10 text-primary border-none">
                You
              </Badge>
            )}
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isCurrentUser && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          {isEditing ? (
            <div className="space-y-3 mt-2">
              <Textarea
                className="min-h-[100px] bg-background focus-visible:ring-primary/20"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEditSave} className="h-8 gap-1">
                  <Check className="h-3 w-3" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 gap-1">
                  <X className="h-3 w-3" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {comment.content}
            </ReactMarkdown>
          )}
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center bg-muted/50 rounded-full px-1 py-0.5 border border-transparent hover:border-border transition-all">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-full ${currentUserVote === "upvote" ? "text-emerald-500 bg-emerald-500/10" : ""}`}
              onClick={() => handleVote("upvote")}
            >
              <ThumbsUp className={`h-3.5 w-3.5 ${currentUserVote === "upvote" ? "fill-current" : ""}`} />
            </Button>
            <span className="text-xs font-semibold px-1 tabular-nums">
              {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-full ${currentUserVote === "downvote" ? "text-rose-500 bg-rose-500/10" : ""}`}
              onClick={() => handleVote("downvote")}
            >
              <ThumbsDown className={`h-3.5 w-3.5 ${currentUserVote === "downvote" ? "fill-current" : ""}`} />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setShowReplyBox(!showReplyBox)}
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </Button>
        </div>

        {showReplyBox && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-3 pt-4 pl-2 border-l-2 border-primary/20"
          >
            <Textarea
              className="min-h-[80px] text-sm bg-muted/20"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a thoughtful reply..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReplyBox(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleReplySubmit} className="gap-2">
                <Send className="h-3.5 w-3.5" /> Post Reply
              </Button>
            </div>
          </motion.div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-4 space-y-2 border-l-2 border-muted pl-4 ml-1">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;