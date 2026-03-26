import { useState } from "react";
import {
  MessageSquare,
  Share2,
  MoreHorizontal,
  Send,
  Loader2,
  Trash2,
  Edit2,
  ArrowBigUp,
  ArrowBigDown,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetCommentsByPostIdQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentVoteMutation,
} from "../app/api/commentsApi";
import {
  useToggleVoteMutation,
  useDeletePostMutation,
} from "../app/api/postsApi";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { cn, getAvatarUrl, getCommunityIconUrl } from "@/lib/utils";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// ─── Single Comment (recursive) ───────────────────────────────────────────────
const CommentItem = ({ comment, postId, depth = 0 }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [childrenVisible, setChildrenVisible] = useState(true);

  // Optimistic local vote state for this comment
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes || []);
  const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes || []);

  const [createComment, { isLoading: submittingReply }] =
    useCreateCommentMutation();
  const [deleteComment, { isLoading: deletingComment }] =
    useDeleteCommentMutation();
  const [toggleCommentVote] = useToggleCommentVoteMutation();

  const isAuthor =
    userInfo?._id === (comment.createdBy?._id || comment.createdBy);
  const hasUpvoted = localUpvotes.includes(userInfo?._id);
  const hasDownvoted = localDownvotes.includes(userInfo?._id);
  const voteScore = localUpvotes.length - localDownvotes.length;
  const hasReplies = comment.replies?.length > 0;

  const handleVote = async (type) => {
    if (!userInfo) {
      toast.error("Please login to vote");
      return;
    }

    // Optimistic update — mutate local state immediately
    const uid = userInfo._id;
    if (type === "upvote") {
      if (hasUpvoted) {
        setLocalUpvotes((p) => p.filter((id) => id !== uid));
      } else {
        setLocalUpvotes((p) => [...p, uid]);
        setLocalDownvotes((p) => p.filter((id) => id !== uid));
      }
    } else {
      if (hasDownvoted) {
        setLocalDownvotes((p) => p.filter((id) => id !== uid));
      } else {
        setLocalDownvotes((p) => [...p, uid]);
        setLocalUpvotes((p) => p.filter((id) => id !== uid));
      }
    }

    try {
      await toggleCommentVote({
        commentId: comment._id,
        postId,
        type,
      }).unwrap();
    } catch {
      // Revert on failure
      setLocalUpvotes(comment.upvotes || []);
      setLocalDownvotes(comment.downvotes || []);
      toast.error("Vote failed");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await createComment({
        postId,
        content: replyText,
        parentId: comment._id,
      }).unwrap();
      setReplyText("");
      setReplyOpen(false);
      toast.success("Reply posted!");
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({ commentId: comment._id, postId }).unwrap();
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

    const avatarUrl = getAvatarUrl(comment.createdBy);

  return (
    <div
      className="relative animate-in fade-in duration-200"
      style={{ paddingLeft: depth > 0 ? `${Math.min(depth, 4) * 18}px` : 0 }}
    >
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50 ml-2" />
      )}

      <div className="flex gap-2.5 group py-1.5">
        <div className="shrink-0 w-6 h-6 rounded-full bg-muted/30 border border-border/20 overflow-hidden mt-0.5 shadow-xs flex items-center justify-center">
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${comment.createdBy?.username}`}
              className="text-[10px] font-bold text-foreground/70 hover:text-primary transition-colors tracking-tight"
            >
              u/{comment.createdBy?.username}
            </Link>
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter opacity-50">
              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-1 -ml-1 pt-0.5 flex-wrap">
            {/* Vote pill — ONLY for this comment */}
            <div className="flex items-center gap-0.5 bg-muted/5 rounded-lg px-0.5 border border-border/10">
              <button
                onClick={() => handleVote("upvote")}
                title="Upvote comment"
                className={`h-5 w-5 flex items-center justify-center rounded transition-colors ${
                  hasUpvoted
                    ? "text-orange-500"
                    : "text-muted-foreground/30 hover:text-orange-500"
                }`}
              >
                <ArrowBigUp
                  size={14}
                  fill={hasUpvoted ? "currentColor" : "none"}
                />
              </button>
              <span
                className={`text-[10px] font-bold min-w-[12px] text-center ${
                  hasUpvoted
                    ? "text-orange-500"
                    : hasDownvoted
                      ? "text-indigo-500"
                      : "text-foreground/50"
                }`}
              >
                {voteScore}
              </span>
              <button
                onClick={() => handleVote("downvote")}
                title="Downvote comment"
                className={`h-5 w-5 flex items-center justify-center rounded transition-colors ${
                  hasDownvoted
                    ? "text-indigo-500"
                    : "text-muted-foreground/30 hover:text-indigo-500"
                }`}
              >
                <ArrowBigDown
                  size={14}
                  fill={hasDownvoted ? "currentColor" : "none"}
                />
              </button>
            </div>

            {userInfo && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                  replyOpen
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <CornerDownRight size={10} /> Reply
              </button>
            )}

            {hasReplies && (
              <button
                onClick={() => setChildrenVisible(!childrenVisible)}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded text-muted-foreground/30 hover:text-foreground hover:bg-muted/30 transition-all"
              >
                {childrenVisible ? (
                  <ChevronUp size={10} />
                ) : (
                  <ChevronDown size={10} />
                )}
                {comment.replies.length}
              </button>
            )}

            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deletingComment}
                className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 transition-all ml-auto opacity-0 group-hover:opacity-100"
              >
                {deletingComment ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <Trash2 size={10} />
                )}
              </button>
            )}
          </div>

          {replyOpen && (
            <form
              onSubmit={handleReply}
              className="relative mt-2 animate-in slide-in-from-top-1 duration-150"
            >
              <Input
                autoFocus
                placeholder={`Reply to u/${comment.createdBy?.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="pr-10 h-9 text-sm rounded-xl bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              />
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary disabled:opacity-30 transition-colors"
              >
                {submittingReply ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {hasReplies && childrenVisible && (
        <div className="mt-0.5">
          {comment.replies.map((child) => (
            <CommentItem
              key={child._id}
              comment={child}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main PostCard ─────────────────────────────────────────────────────────────
const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Separate optimistic state for POST votes only
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes || []);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes || []);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Comments are fetched only when the section is opened
  const { data: comments, isLoading: loadingComments } =
    useGetCommentsByPostIdQuery(post._id, { skip: !showComments });
  const [createComment, { isLoading: submittingComment }] =
    useCreateCommentMutation();
  const [toggleVote] = useToggleVoteMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // Post-level vote state (optimistic)
  const isAuthor = userInfo?._id === (post.author?._id || post.author);
  const hasUpvoted = localUpvotes.includes(userInfo?._id);
  const hasDownvoted = localDownvotes.includes(userInfo?._id);
  const voteScore = localUpvotes.length - localDownvotes.length;

  // Comment count: server gives us `post.commentCount` (real count from Comment collection).
  // When panel is open, switch to the live recursive count from the fetched tree.
  const countRecursive = (list) =>
    (list || []).reduce((acc, c) => acc + 1 + countRecursive(c.replies), 0);
  const commentCount =
    showComments && comments != null
      ? countRecursive(comments)
      : (post.commentCount ?? post.comments?.length ?? 0);

  const handleRootComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment({ postId: post._id, content: newComment }).unwrap();
      setNewComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  // Post vote — optimistic, does NOT touch comment votes
  const handleVote = async (type) => {
    if (!userInfo) {
      toast.error("Please login to vote");
      return;
    }
    const uid = userInfo._id;
    // Snapshot for rollback
    const prevUp = [...localUpvotes];
    const prevDown = [...localDownvotes];

    if (type === "upvote") {
      if (hasUpvoted) {
        setLocalUpvotes((p) => p.filter((id) => id !== uid));
      } else {
        setLocalUpvotes((p) => [...p, uid]);
        setLocalDownvotes((p) => p.filter((id) => id !== uid));
      }
    } else {
      if (hasDownvoted) {
        setLocalDownvotes((p) => p.filter((id) => id !== uid));
      } else {
        setLocalDownvotes((p) => [...p, uid]);
        setLocalUpvotes((p) => p.filter((id) => id !== uid));
      }
    }

    try {
      await toggleVote({ id: post._id, type }).unwrap();
    } catch {
      // Rollback
      setLocalUpvotes(prevUp);
      setLocalDownvotes(prevDown);
      toast.error("Failed to update vote");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

    const avatarUrl = getAvatarUrl(post.author);

  return (
    <article className="rounded-xl border border-border/40 bg-card overflow-hidden hover:border-border/60 hover:shadow-xs transition-all duration-200">
      <div className="p-4 flex gap-3">
        {/* POST vote sidebar — completely isolated from comment votes */}
        <div className="flex flex-col items-center gap-0.5 min-w-[32px] pt-0.5">
          <button
            onClick={() => handleVote("upvote")}
            title="Upvote post"
            className={`flex items-center justify-center h-7 w-7 rounded-lg transition-colors hover:bg-primary/5 ${
              hasUpvoted
                ? "text-primary"
                : "text-muted-foreground/30 hover:text-primary"
            }`}
          >
            <ArrowBigUp
              size={20}
              fill={hasUpvoted ? "currentColor" : "none"}
              strokeWidth={2.5}
            />
          </button>
          <span
            className={`text-[12px] font-black leading-none py-0.5 ${
              hasUpvoted
                ? "text-primary"
                : hasDownvoted
                  ? "text-secondary"
                  : "text-foreground/60"
            }`}
          >
            {voteScore}
          </span>
          <button
            onClick={() => handleVote("downvote")}
            title="Downvote post"
            className={`flex items-center justify-center h-7 w-7 rounded-lg transition-colors hover:bg-secondary/5 ${
              hasDownvoted
                ? "text-secondary"
                : "text-muted-foreground/30 hover:text-secondary"
            }`}
          >
            <ArrowBigDown
              size={20}
              fill={hasDownvoted ? "currentColor" : "none"}
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${post.author?.username}`}
                className="shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-muted border border-border/20 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img src={getAvatarUrl(post.author)} alt="" className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                {post.community && (
                  <>
                    <Link
                      to={`/communities/${post.community.name}`}
                      className="text-foreground/80 font-bold hover:text-primary cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <div className="w-4 h-4 rounded-full bg-muted border border-border/20 overflow-hidden shrink-0">
                        <img src={getCommunityIconUrl(post.community)} alt="" className="w-full h-full object-cover" />
                      </div>
                      c/{post.community.name}
                    </Link>
                    <span className="text-muted-foreground/20">•</span>
                  </>
                )}
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="hover:text-primary transition-colors font-bold opacity-70"
                >
                  u/{post.author?.username || "anon"}
                </Link>
                <span className="text-muted-foreground/20">•</span>
                <span className="opacity-60">
                  {new Date(post.createdAt || Date.now()).toLocaleDateString(
                    undefined,
                    { month: "short", day: "numeric" },
                  )}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground/30 hover:text-foreground">
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-lg w-36 border-border/40"
              >
                <DropdownMenuItem className="gap-2 cursor-pointer rounded-md text-[12px] font-bold">
                  <Share2 size={12} /> Share
                </DropdownMenuItem>
                {isAuthor && (
                  <>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer rounded-md text-[12px] font-bold"
                      onClick={() => toast.info("Edit coming soon!")}
                    >
                      <Edit2 size={12} /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-destructive focus:text-destructive rounded-md text-[12px] font-bold"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h2 className="text-[14px] font-bold leading-snug text-foreground/90 mb-1">
            {post.title}
          </h2>
          {post.content && (
            <p className="text-[13px] text-muted-foreground/80 whitespace-pre-wrap leading-relaxed font-medium">
              {post.content}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20 -ml-1">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                showComments
                  ? "bg-primary/5 text-primary"
                  : "text-muted-foreground/50 hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              <MessageSquare size={13} strokeWidth={2.5} />
              <span>{commentCount}</span>
              <span className="hidden sm:inline">
                {commentCount === 1 ? "Comment" : "Comments"}
              </span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] text-muted-foreground/50 hover:bg-muted/40 hover:text-foreground transition-all">
              <Share2 size={13} strokeWidth={2.5} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comment panel — only rendered when open */}
      {showComments && (
        <div className="border-t border-border/40 bg-muted/5 p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {userInfo ? (
            <form onSubmit={handleRootComment}>
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 shrink-0 rounded-full bg-muted border border-border/40 overflow-hidden mt-1 shadow-xs">
                  <img
                    src={getAvatarUrl(userInfo)}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="pr-10 h-10 text-sm rounded-xl bg-card border-border/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary disabled:opacity-30 transition-colors"
                  >
                    {submittingComment ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <p className="text-xs text-center text-muted-foreground py-2">
              <button
                onClick={() => navigate("/login")}
                className="text-primary font-bold hover:underline"
              >
                Log in
              </button>{" "}
              to join the conversation
            </p>
          )}

          <div className="space-y-0 pt-1">
            {loadingComments ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
              </div>
            ) : comments?.length > 0 ? (
              <div className="divide-y divide-border/20">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    depth={0}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-6 italic">
                No comments yet — be the first!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
