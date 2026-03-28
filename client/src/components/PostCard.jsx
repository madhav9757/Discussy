import { useState, useRef, useEffect } from "react";
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
  Bookmark,
  Flag,
  Link2,
  Check,
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
import { cn, getAvatarUrl, getCommunityIconUrl } from "@/lib/utils";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/* ── Helpers ── */
const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const Img = ({ src, alt = "", className }) => (
  <img
    src={src}
    alt={alt}
    className={cn("object-cover w-full h-full", className)}
  />
);

/* ── Copy link with feedback ── */
const useCopyLink = (postId) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return { copied, copy };
};

/* ── Vote button ── */
const VoteBtn = ({ direction, active, onClick, size = 18 }) => {
  const Icon = direction === "up" ? ArrowBigUp : ArrowBigDown;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded transition-colors",
        direction === "up"
          ? active
            ? "text-orange-500"
            : "text-muted-foreground/30 hover:text-orange-500 hover:bg-orange-500/5"
          : active
            ? "text-indigo-500"
            : "text-muted-foreground/30 hover:text-indigo-500 hover:bg-indigo-500/5",
      )}
      style={{ width: size + 8, height: size + 8 }}
    >
      <Icon
        size={size}
        fill={active ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
};

/* ── Avatar ── */
const Av = ({ src, size = 6, fallback }) => (
  <div
    className="rounded-full bg-muted border border-border/20 overflow-hidden shrink-0 flex items-center justify-center"
    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
  >
    {src ? (
      <Img src={src} />
    ) : (
      <span className="text-[10px] font-bold text-muted-foreground">
        {fallback?.charAt(0)?.toUpperCase()}
      </span>
    )}
  </div>
);

/* ── Comment item (recursive) ── */
const CommentItem = ({ comment, postId, depth = 0, focusId, setFocusId }) => {
  const { userInfo } = useSelector((s) => s.auth);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const replyRef = useRef(null);

  const [localUp, setLocalUp] = useState(comment.upvotes || []);
  const [localDown, setLocalDown] = useState(comment.downvotes || []);

  const [createComment, { isLoading: submittingReply }] =
    useCreateCommentMutation();
  const [deleteComment, { isLoading: deleting }] = useDeleteCommentMutation();
  const [toggleCommentVote] = useToggleCommentVoteMutation();

  const uid = userInfo?._id;
  const isAuthor = uid === (comment.createdBy?._id || comment.createdBy);
  const hasUp = localUp.includes(uid);
  const hasDown = localDown.includes(uid);
  const score = localUp.length - localDown.length;
  const hasReplies = comment.replies?.length > 0;

  useEffect(() => {
    if (replyOpen && replyRef.current) replyRef.current.focus();
  }, [replyOpen]);

  const vote = async (type) => {
    if (!userInfo) return toast.error("Login to vote");
    const prevUp = [...localUp];
    const prevDown = [...localDown];
    if (type === "upvote") {
      hasUp
        ? setLocalUp((p) => p.filter((id) => id !== uid))
        : (setLocalUp((p) => [...p, uid]),
          setLocalDown((p) => p.filter((id) => id !== uid)));
    } else {
      hasDown
        ? setLocalDown((p) => p.filter((id) => id !== uid))
        : (setLocalDown((p) => [...p, uid]),
          setLocalUp((p) => p.filter((id) => id !== uid)));
    }
    try {
      await toggleCommentVote({
        commentId: comment._id,
        postId,
        type,
      }).unwrap();
    } catch {
      setLocalUp(prevUp);
      setLocalDown(prevDown);
      toast.error("Vote failed");
    }
  };

  const reply = async (e) => {
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
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const remove = async () => {
    try {
      await deleteComment({ commentId: comment._id, postId }).unwrap();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const indent = Math.min(depth, 5) * 14;

  return (
    <div style={{ paddingLeft: indent }}>
      <div className="relative group">
        {/* Thread line */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border/30 hover:bg-border/70 transition-colors cursor-pointer"
            style={{ left: -8 }}
            onClick={() => setCollapsed(!collapsed)}
          />
        )}

        <div className={cn("py-2", collapsed && "opacity-50")}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${comment.createdBy?.username}`}>
              <Av
                src={getAvatarUrl(comment.createdBy)}
                size={5}
                fallback={comment.createdBy?.username}
              />
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Link
                to={`/profile/${comment.createdBy?.username}`}
                className="text-[11px] font-bold text-foreground/80 hover:text-primary transition-colors"
              >
                u/{comment.createdBy?.username}
              </Link>
              <span className="text-[10px] text-muted-foreground/40">
                {timeAgo(comment.createdAt)}
              </span>
              {isAuthor && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded">
                  OP
                </span>
              )}
            </div>
            {hasReplies && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="ml-auto flex items-center gap-1 text-[10px] font-bold text-muted-foreground/30 hover:text-foreground transition-colors"
              >
                {collapsed ? (
                  <ChevronDown size={10} />
                ) : (
                  <ChevronUp size={10} />
                )}
                {collapsed ? `${comment.replies.length} replies` : ""}
              </button>
            )}
          </div>

          {!collapsed && (
            <>
              {/* Body */}
              {editing ? (
                <div className="flex gap-2 mt-1 mb-1.5">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 text-[12.5px] leading-relaxed bg-muted/30 border border-border/40 rounded-lg px-3 py-2 outline-none resize-none focus:border-border/70 transition-colors"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setEditing(false)}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-foreground text-background"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditText(comment.content);
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-muted/50 text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[12.5px] text-foreground/80 leading-relaxed mb-1.5 pl-7">
                  {comment.content}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-0.5 pl-7">
                {/* vote */}
                <div className="flex items-center gap-0.5 mr-1">
                  <VoteBtn
                    direction="up"
                    active={hasUp}
                    onClick={() => vote("upvote")}
                    size={12}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold min-w-[14px] text-center",
                      hasUp
                        ? "text-orange-500"
                        : hasDown
                          ? "text-indigo-500"
                          : "text-foreground/40",
                    )}
                  >
                    {score}
                  </span>
                  <VoteBtn
                    direction="down"
                    active={hasDown}
                    onClick={() => vote("downvote")}
                    size={12}
                  />
                </div>

                {userInfo && (
                  <button
                    onClick={() => setReplyOpen(!replyOpen)}
                    className={cn(
                      "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded transition-all",
                      replyOpen
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/30",
                    )}
                  >
                    <CornerDownRight size={9} /> Reply
                  </button>
                )}

                {/* author actions — visible on hover */}
                {isAuthor && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded text-muted-foreground/30 hover:text-foreground hover:bg-muted/30 transition-all"
                    >
                      <Edit2 size={9} />
                    </button>
                    <button
                      onClick={remove}
                      disabled={deleting}
                      className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all"
                    >
                      {deleting ? (
                        <Loader2 size={9} className="animate-spin" />
                      ) : (
                        <Trash2 size={9} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Reply box */}
              {replyOpen && (
                <form onSubmit={reply} className="flex gap-2 mt-2 pl-7">
                  <input
                    ref={replyRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to u/${comment.createdBy?.username}…`}
                    className="flex-1 h-8 text-[12px] bg-muted/30 border border-border/30 rounded-lg px-3 outline-none focus:border-border/70 transition-colors placeholder:text-muted-foreground/30"
                    onKeyDown={(e) => e.key === "Escape" && setReplyOpen(false)}
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || !replyText.trim()}
                    className="w-8 h-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 disabled:opacity-30 flex items-center justify-center transition-colors"
                  >
                    {submittingReply ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Send size={11} />
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {!collapsed && hasReplies && (
        <div>
          {comment.replies.map((child) => (
            <CommentItem
              key={child._id}
              comment={child}
              postId={postId}
              depth={depth + 1}
              focusId={focusId}
              setFocusId={setFocusId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Comment input ── */
const CommentInput = ({ userInfo, onSubmit, loading, navigate }) => {
  const [text, setText] = useState("");
  const ref = useRef(null);

  if (!userInfo) {
    return (
      <p className="text-[11px] text-center text-muted-foreground py-2">
        <button
          onClick={() => navigate("/login")}
          className="font-bold text-foreground underline underline-offset-2"
        >
          Log in
        </button>{" "}
        to comment
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text);
        setText("");
      }}
      className="flex gap-2 items-center"
    >
      <Av src={getAvatarUrl(userInfo)} size={6} fallback={userInfo.username} />
      <div className="flex-1 relative">
        <input
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="w-full h-9 text-[12.5px] bg-muted/20 border border-border/30 rounded-lg px-3 pr-10 outline-none focus:border-border/60 transition-colors placeholder:text-muted-foreground/30"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground disabled:opacity-30 transition-colors"
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Send size={13} />
          )}
        </button>
      </div>
    </form>
  );
};

/* ── PostCard ── */
const PostCard = ({ post, customLayout, initialShowComments = false }) => {
  const [showComments, setShowComments] = useState(initialShowComments);
  const [saved, setSaved] = useState(false);
  const [focusId, setFocusId] = useState(null);
  const [localUp, setLocalUp] = useState(post.upvotes || []);
  const [localDown, setLocalDown] = useState(post.downvotes || []);

  const { userInfo } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { copied, copy } = useCopyLink(post._id);

  const { data: comments, isLoading: loadingComments } =
    useGetCommentsByPostIdQuery(post._id, { skip: !showComments });
  const [createComment, { isLoading: submittingComment }] =
    useCreateCommentMutation();
  const [toggleVote] = useToggleVoteMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const uid = userInfo?._id;
  const isAuthor = uid === (post.author?._id || post.author);
  const hasUp = localUp.includes(uid);
  const hasDown = localDown.includes(uid);
  const score = localUp.length - localDown.length;

  const countAll = (list = []) =>
    list.reduce((a, c) => a + 1 + countAll(c.replies), 0);
  const commentCount =
    showComments && comments != null
      ? countAll(comments)
      : (post.commentCount ?? post.comments?.length ?? 0);

  const vote = async (type) => {
    if (!userInfo) return toast.error("Login to vote");
    const prevUp = [...localUp];
    const prevDown = [...localDown];
    if (type === "upvote") {
      hasUp
        ? setLocalUp((p) => p.filter((id) => id !== uid))
        : (setLocalUp((p) => [...p, uid]),
          setLocalDown((p) => p.filter((id) => id !== uid)));
    } else {
      hasDown
        ? setLocalDown((p) => p.filter((id) => id !== uid))
        : (setLocalDown((p) => [...p, uid]),
          setLocalUp((p) => p.filter((id) => id !== uid)));
    }
    try {
      await toggleVote({ id: post._id, type }).unwrap();
    } catch {
      setLocalUp(prevUp);
      setLocalDown(prevDown);
      toast.error("Vote failed");
    }
  };

  const submitComment = async (text) => {
    try {
      await createComment({ postId: post._id, content: text }).unwrap();
    } catch {
      toast.error("Failed to post");
    }
  };

  const remove = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ── customLayout: just comments (used in PostDetail) ── */
  if (customLayout) {
    return (
      <div className="space-y-4">
        <CommentInput
          userInfo={userInfo}
          onSubmit={submitComment}
          loading={submittingComment}
          navigate={navigate}
        />
        <div>
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/30" />
            </div>
          ) : comments?.length > 0 ? (
            <div className="space-y-0">
              {comments.map((c) => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  postId={post._id}
                  depth={0}
                  focusId={focusId}
                  setFocusId={setFocusId}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/15" />
              <p className="text-[11px] text-muted-foreground/40 font-medium uppercase tracking-wider">
                No comments yet
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── default card ── */
  return (
    <article className="border-b border-border/15 hover:bg-muted/5 transition-colors duration-150">
      <div className="flex gap-3 px-3 pt-3 pb-2">
        {/* Vote column */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
          <VoteBtn
            direction="up"
            active={hasUp}
            onClick={() => vote("upvote")}
            size={16}
          />
          <span
            className={cn(
              "text-[11px] font-black leading-none",
              hasUp
                ? "text-orange-500"
                : hasDown
                  ? "text-indigo-500"
                  : "text-foreground/50",
            )}
          >
            {score}
          </span>
          <VoteBtn
            direction="down"
            active={hasDown}
            onClick={() => vote("downvote")}
            size={16}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] text-muted-foreground min-w-0">
              {post.community && (
                <>
                  <Link
                    to={`/communities/${post.community.name}`}
                    className="flex items-center gap-1 font-bold text-foreground/70 hover:text-primary transition-colors"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-muted border border-border/20 overflow-hidden shrink-0">
                      <Img src={getCommunityIconUrl(post.community)} />
                    </div>
                    c/{post.community.name}
                  </Link>
                  <span className="text-border/50">·</span>
                </>
              )}
              <Link
                to={`/profile/${post.author?.username}`}
                className="font-medium hover:text-foreground/80 transition-colors"
              >
                u/{post.author?.username || "anon"}
              </Link>
              <span className="text-border/50">·</span>
              <span className="opacity-50">{timeAgo(post.createdAt)}</span>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted/50 text-muted-foreground/30 hover:text-foreground transition-colors shrink-0">
                  <MoreHorizontal size={13} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 rounded-lg border-border/30 text-[12px]"
              >
                <DropdownMenuItem
                  onClick={copy}
                  className="gap-2 cursor-pointer font-medium rounded-md"
                >
                  {copied ? <Check size={11} /> : <Link2 size={11} />}
                  {copied ? "Copied!" : "Copy link"}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-md">
                  <Share2 size={11} /> Share
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer font-medium rounded-md">
                  <Flag size={11} /> Report
                </DropdownMenuItem>
                {isAuthor && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toast.info("Edit coming soon")}
                      className="gap-2 cursor-pointer font-medium rounded-md"
                    >
                      <Edit2 size={11} /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={remove}
                      disabled={isDeleting}
                      className="gap-2 cursor-pointer font-medium rounded-md text-destructive focus:text-destructive"
                    >
                      {isDeleting ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Trash2 size={11} />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h2
            className="text-[13.5px] font-semibold leading-snug text-foreground/90 mb-1 cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/post/${post._id}`)}
          >
            {post.title}
          </h2>

          {/* Body preview */}
          {post.content && (
            <p className="text-[12px] text-muted-foreground/70 line-clamp-2 leading-relaxed mb-2">
              {post.content}
            </p>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-0.5 -ml-1.5">
            <button
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold transition-all",
                showComments
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/30",
              )}
            >
              <MessageSquare size={12} strokeWidth={2} />
              <span>{commentCount}</span>
              <span className="hidden sm:inline">
                {commentCount === 1 ? "comment" : "comments"}
              </span>
            </button>

            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold text-muted-foreground/40 hover:text-foreground hover:bg-muted/30 transition-all"
            >
              {copied ? (
                <Check size={12} strokeWidth={2} />
              ) : (
                <Share2 size={12} strokeWidth={2} />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Share"}
              </span>
            </button>

            <button
              onClick={() => setSaved((s) => !s)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold transition-all",
                saved
                  ? "text-foreground bg-muted/40"
                  : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/30",
              )}
            >
              <Bookmark
                size={12}
                strokeWidth={2}
                fill={saved ? "currentColor" : "none"}
              />
              <span className="hidden sm:inline">
                {saved ? "Saved" : "Save"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Comment panel */}
      {showComments && (
        <div className="border-t border-border/10 bg-muted/5 px-4 py-3 space-y-3">
          <CommentInput
            userInfo={userInfo}
            onSubmit={submitComment}
            loading={submittingComment}
            navigate={navigate}
          />
          <div>
            {loadingComments ? (
              <div className="flex justify-center py-5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/20" />
              </div>
            ) : comments?.length > 0 ? (
              <div>
                {comments.map((c) => (
                  <CommentItem
                    key={c._id}
                    comment={c}
                    postId={post._id}
                    depth={0}
                    focusId={focusId}
                    setFocusId={setFocusId}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground/30 py-4 italic">
                Be the first to comment
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
