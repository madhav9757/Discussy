import React, { useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Pencil,
  Reply,
  Send,
  MoreHorizontal,
  X,
  Check,
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
import { cn } from "@/lib/utils";

const CommentItem = ({ comment, onRefresh }) => {
  const user = useSelector((state) => state.auth.userInfo);
  const isCurrentUser =
    user && String(comment.createdBy?._id) === String(user._id);

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
      await delComment({
        commentId: comment._id,
        postId: comment.postId,
      }).unwrap();
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
    <div className="group flex gap-4 py-6 border-b border-border/40 last:border-0">
      <Avatar className="h-9 w-9 border rounded-md">
        <AvatarImage src={comment.createdBy?.image} />
        <AvatarFallback className="font-bold text-xs bg-muted">
          {comment.createdBy?.username?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight">
              u/{comment.createdBy?.username || "Anonymous"}
            </span>
            {isCurrentUser && (
              <Badge
                variant="secondary"
                className="text-[9px] h-4 px-1 font-black uppercase tracking-widest bg-muted border-none ring-1 ring-border/50"
              >
                You
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: false,
              })}{" "}
              ago
            </span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {isCurrentUser && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="text-xs font-bold uppercase tracking-tight"
                >
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive font-black"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="text-sm leading-relaxed text-foreground/90 font-medium">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                className="min-h-[100px] bg-background border-2 focus-visible:ring-0 focus-visible:border-foreground"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEditSave}
                  className="h-8 font-bold uppercase tracking-tight text-[10px]"
                >
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-8 font-bold uppercase tracking-tight text-[10px] border-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {comment.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/20">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                currentUserVote === "upvote"
                  ? "bg-foreground text-background"
                  : "hover:bg-muted",
              )}
              onClick={() => handleVote("upvote")}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] font-black px-1 min-w-[1.2rem] text-center">
              {(comment.upvotes?.length || 0) -
                (comment.downvotes?.length || 0)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 transition-colors",
                currentUserVote === "downvote"
                  ? "bg-foreground text-background"
                  : "hover:bg-muted",
              )}
              onClick={() => handleVote("downvote")}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
            onClick={() => setShowReplyBox(!showReplyBox)}
          >
            <Reply className="h-3 w-3" />
            Reply
          </Button>
        </div>

        {showReplyBox && (
          <div className="space-y-4 pt-2 border-l-2 border-foreground/10 pl-6 ml-1">
            <Textarea
              className="min-h-[80px] text-xs bg-muted/30 border-2 focus-visible:ring-0 focus-visible:border-foreground"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Your reply..."
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 font-bold uppercase tracking-tight text-[10px] border-2"
                onClick={() => setShowReplyBox(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReplySubmit}
                className="h-8 font-bold uppercase tracking-tight text-[10px]"
              >
                Post
              </Button>
            </div>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-6 space-y-0 border-l border-border/50 pl-6 -ml-1">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
