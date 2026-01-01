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
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Trash2,
  Pencil,
  User as UserIcon,
  Copy,
  Check,
  Share2,
  ExternalLink
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const currentVote =
    post.upvotes.includes(user?._id)
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
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="container max-w-6xl py-8 px-4"
      >
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 hover:bg-primary/5 text-muted-foreground transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to feed
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-border/60 overflow-hidden shadow-sm">
              <CardHeader className="p-6 pb-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    {post.category}
                  </Badge>
                  <Separator orientation="vertical" className="h-4" />
                  <Link to={`/community/${post.community._id}`} className="text-sm font-medium hover:text-primary transition-colors">
                    r/{post.community.name}
                  </Link>
                </div>
                
                <h1 className="text-3xl font-bold tracking-tight leading-tight">
                  {post.title}
                </h1>
              </CardHeader>

              <CardContent className="px-6 prose prose-slate dark:prose-invert max-w-none pb-8">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: ({ children }) => <div className="relative group">{children}</div>,
                    code({ inline, children, className }) {
                      const value = String(children).replace(/\n$/, "");
                      if (inline) return <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>;
                      return (
                        <div className="my-4 rounded-lg overflow-hidden border bg-zinc-950">
                          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-mono">code snippet</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-zinc-400 hover:text-white"
                              onClick={() => copyToClipboard(value)}
                            >
                              {copied === value ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
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

              <Separator className="bg-border/40" />

              <CardFooter className="p-4 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-1 bg-background rounded-full p-1 border shadow-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-full transition-all ${currentVote === "up" ? "text-emerald-500 bg-emerald-500/10" : "hover:text-emerald-500"}`}
                        onClick={() => handleVote("upvote")}
                      >
                        <ThumbsUp className={`h-4.5 w-4.5 ${currentVote === "up" ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Appreciate</TooltipContent>
                  </Tooltip>

                  <span className="text-sm font-bold px-2 tabular-nums">
                    {(post.upvotes.length || 0) - (post.downvotes.length || 0)}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-9 w-9 rounded-full transition-all ${currentVote === "down" ? "text-rose-500 bg-rose-500/10" : "hover:text-rose-500"}`}
                        onClick={() => handleVote("downvote")}
                      >
                        <ThumbsDown className={`h-4.5 w-4.5 ${currentVote === "down" ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dislike</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => copyToClipboard(window.location.href)}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  
                  {(user?._id === post.author._id || user?._id === post.community.createdBy) && (
                    <>
                      <Button variant="ghost" size="sm" className="gap-2 text-amber-600 hover:bg-amber-50" onClick={() => navigate(`/edit-post/${post._id}`)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:bg-destructive/5" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>

            {/* Comments Section */}
            <div className="space-y-6" id="comments">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Discussion ({comments.length})</h3>
              </div>

              {user ? (
                <div className="bg-card border rounded-xl p-4">
                   <CommentInput postId={id} />
                </div>
              ) : (
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Log in to join the conversation</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((c) => <CommentItem key={c._id} comment={c} />)
                ) : (
                  <p className="text-center py-12 text-muted-foreground italic">No comments yet. Be the first to speak up!</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-border/60 shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Poster</h4>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.author.username}`} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link to={`/user/${post.author._id}`} className="font-bold hover:text-primary transition-colors block truncate">
                      u/{post.author.username}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(post.author.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {post.author.bio && (
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    "{post.author.bio}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg text-center">
                  <div>
                    <p className="text-lg font-bold">{post.author.postsCount || 0}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Posts</p>
                  </div>
                  <div className="border-l border-border/50">
                    <p className="text-lg font-bold">{post.author.commentsCount || 0}</p>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Comments</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2 group" asChild>
                  <Link to={`/user/${post.author._id}`}>
                    <UserIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    View Full Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary/[0.02] border-primary/10">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-1 p-1.5 rounded-md bg-primary/10">
                  <ExternalLink className="h-3 w-3 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-tighter text-primary">Community Guidelines</p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Remember to be civil and follow community rules for r/{post.community.name}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

const PostSkeleton = () => (
  <div className="container max-w-6xl py-12 px-4 space-y-8 animate-pulse">
    <div className="h-8 w-32 bg-muted rounded" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="h-[400px] w-full bg-muted rounded-xl" />
        <div className="h-24 w-full bg-muted rounded-xl" />
      </div>
      <div className="lg:col-span-4">
        <div className="h-64 w-full bg-muted rounded-xl" />
      </div>
    </div>
  </div>
);

export default PostDetailsPage;