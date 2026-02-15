import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Trash2,
  Pencil,
  User as UserIcon,
  Copy,
  Check,
  Share2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import CommentInput from "@/components/comment/commentInput/CommentInput";
import CommentItem from "@/components/comment/CommentItem/CommentItem";

import {
  useGetPostByIdQuery,
  useToggleVoteMutation,
  useDeletePostMutation,
} from "@/app/api/postsApi";
import { useGetCommentsByPostIdQuery } from "@/app/api/commentsApi";

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.userInfo);

  const { data: post, isLoading } = useGetPostByIdQuery(id);
  const { data: comments = [] } = useGetCommentsByPostIdQuery(id);

  const [toggleVote] = useToggleVoteMutation();
  const [deletePost] = useDeletePostMutation();

  const [copied, setCopied] = useState(null);

  if (isLoading || !post) return <PostSkeleton />;

  const currentVote = post.upvotes.includes(user?._id)
    ? "up"
    : post.downvotes.includes(user?._id)
      ? "down"
      : null;

  const handleVote = async (type) => {
    if (!user) return navigate("/login");
    try {
      await toggleVote({ id, type }).unwrap();
    } catch (err) {
      toast.error("Failed to update vote");
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast.success("Post deleted");
      navigate(`/community/${post.community._id}`);
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast.success("Copied");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container max-w-5xl py-6 px-4">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 h-8 text-xs text-muted-foreground hover:text-foreground p-0 transition-colors"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-3 w-3" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-none rounded-md">
            <CardHeader className="p-5 pb-3 space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="px-2 py-0 text-[10px] bg-muted/50 text-muted-foreground border-transparent"
                >
                  {post.category}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <Link
                  to={`/community/${post.community._id}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  d/{post.community.name}
                </Link>
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                {post.title}
              </h1>
            </CardHeader>

            <CardContent className="px-5 pb-6 prose prose-slate dark:prose-invert max-w-none prose-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: ({ children }) => (
                    <div className="relative group">{children}</div>
                  ),
                  code({ inline, children, className }) {
                    const value = String(children).replace(/\n$/, "");
                    if (inline)
                      return (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs">
                          {children}
                        </code>
                      );
                    return (
                      <div className="my-3 rounded border bg-muted/30">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            CODE
                          </span>
                          <button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => copyToClipboard(value)}
                          >
                            {copied === value ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-xs leading-relaxed">
                          <code className={className}>{children}</code>
                        </pre>
                      </div>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </CardContent>

            <CardFooter className="p-3 px-5 border-t flex items-center justify-between">
              <div className="flex items-center gap-1 border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 transition-all ${currentVote === "up" ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => handleVote("upvote")}
                >
                  <ArrowBigUp
                    className={`h-4.5 w-4.5 ${currentVote === "up" ? "fill-current" : ""}`}
                  />
                </Button>

                <span className="text-xs font-bold px-1 tabular-nums">
                  {(post.upvotes.length || 0) - (post.downvotes.length || 0)}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 transition-all ${currentVote === "down" ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => handleVote("downvote")}
                >
                  <ArrowBigDown
                    className={`h-4.5 w-4.5 ${currentVote === "down" ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>

                {(user?._id === post.author._id ||
                  user?._id === post.community.createdBy) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-xs text-destructive/80 hover:text-destructive hover:bg-destructive/5"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-4 pt-4" id="comments">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Comments ({comments.length})
              </h3>
            </div>

            {user ? (
              <div className="bg-muted/10 border rounded-md p-3">
                <CommentInput postId={id} />
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed rounded-md bg-muted/5">
                <p className="text-xs text-muted-foreground mb-3">
                  Login to participate in the discussion
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>
            )}

            <div className="space-y-4 pt-2">
              {comments.length > 0 ? (
                comments.map((c) => <CommentItem key={c._id} comment={c} />)
              ) : (
                <p className="text-center py-10 text-xs text-muted-foreground/60 italic font-medium">
                  No comments yet
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-none rounded-md sticky top-20">
            <CardHeader className="p-5 pb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Author
              </h4>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border rounded">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.author.username}`}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link
                    to={`/user/${post.author._id}`}
                    className="text-sm font-bold hover:text-foreground transition-colors block truncate"
                  >
                    u/{post.author.username}
                  </Link>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Member since {new Date(post.author.createdAt).getFullYear()}
                  </p>
                </div>
              </div>

              {post.author.bio && (
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.author.bio}
                </p>
              )}

              <Button
                variant="outline"
                className="w-full h-8 text-xs font-semibold"
                asChild
              >
                <Link to={`/user/${post.author._id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

const PostSkeleton = () => (
  <div className="container max-w-5xl py-10 px-4 space-y-6 animate-pulse">
    <div className="h-6 w-24 bg-muted rounded" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="h-[300px] w-full bg-muted rounded" />
        <div className="h-20 w-full bg-muted rounded" />
      </div>
      <div className="lg:col-span-4">
        <div className="h-48 w-full bg-muted rounded" />
      </div>
    </div>
  </div>
);

export default PostDetailsPage;
