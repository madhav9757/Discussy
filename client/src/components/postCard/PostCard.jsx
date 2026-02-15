import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Share2,
  MoreHorizontal,
  Bookmark,
  Flag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGetCommentsByPostIdQuery } from "../../app/api/commentsApi";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { data: comments = [] } = useGetCommentsByPostIdQuery(post._id, {
    skip: !post._id,
  });

  const handleNavigate = (e) => {
    if (
      e.target.closest("button") ||
      e.target.closest('[role="menuitem"]') ||
      e.target.closest("a")
    )
      return;
    navigate(`/posts/${post._id}`);
  };

  const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  return (
    <div className="w-full">
      <Card
        className="group shadow-none border border-border/50 hover:border-foreground/20 transition-all rounded-md overflow-hidden bg-card cursor-pointer"
        onClick={handleNavigate}
      >
        <CardHeader className="p-4 pb-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-muted/50 border-none ring-1 ring-border/50"
              >
                d/{post.community?.name || "general"}
              </Badge>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight truncate">
                <Avatar className="h-3.5 w-3.5 rounded-sm">
                  <AvatarImage src={post.author?.avatar} />
                  <AvatarFallback className="text-[6px] bg-muted">
                    {post.author?.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hover:text-foreground">
                  u/{post.author?.username}
                </span>
                <span className="opacity-40">•</span>
                <span className="opacity-60">
                  {post.createdAt &&
                    formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: false,
                    })}{" "}
                  ago
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="text-[10px] font-bold uppercase tracking-tight"
              >
                <DropdownMenuItem className="gap-2">
                  <Bookmark className="h-3 w-3" /> Save
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-destructive font-black">
                  <Flag className="h-3 w-3" /> Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardTitle className="text-lg font-bold leading-tight tracking-tight">
            {post.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed font-medium">
            {post.content}
          </p>
        </CardContent>

        <CardFooter className="p-3 px-4 flex items-center gap-6 border-t border-border/30 bg-muted/5">
          <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] font-black px-1 tabular-nums min-w-[1.2rem] text-center">
              {score}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tight">
              {comments.length} Comments
            </span>
          </div>

          <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground ml-auto transition-colors">
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostCard;
