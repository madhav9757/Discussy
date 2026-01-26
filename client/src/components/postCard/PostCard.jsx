import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, ArrowBigUp, ArrowBigDown, Share2, 
  MoreHorizontal, Clock, Flag, Bookmark, UserPlus, 
  ExternalLink 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useGetCommentsByPostIdQuery } from '../../app/api/commentsApi';

// Shadcn UI Components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { data: comments = [] } = useGetCommentsByPostIdQuery(post._id, { skip: !post._id });

  const handleNavigate = (e) => {
    // Only navigate if the click isn't on a button or interactive element
    if (e.target.closest('button') || e.target.closest('[role="menuitem"]') || e.target.closest('a')) return;
    navigate(`/posts/${post._id}`);
  };

  const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group relative border-border/50 bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
        onClick={handleNavigate}
      >
        <div className="flex">
          {/* --- Voting Sidebar (Desktop) --- */}
          <div className="hidden sm:flex flex-col items-center w-12 py-4 bg-muted/10 group-hover:bg-muted/30 transition-colors">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-600 hover:bg-orange-500/10">
              <ArrowBigUp className="h-6 w-6" />
            </Button>
            <span className={cn(
              "text-xs font-black py-1 tabular-nums",
              score > 0 ? "text-orange-600" : score < 0 ? "text-indigo-600" : "text-muted-foreground"
            )}>
              {score}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-indigo-600 hover:bg-indigo-500/10">
              <ArrowBigDown className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  {/* Community Hover Card */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge variant="secondary" className="cursor-pointer bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                        d/{post.community?.name || 'general'}
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage src={post.community?.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {post.community?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">d/{post.community?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {post.community?.description || "A growing community on Discussly."}
                          </p>
                          <div className="flex items-center pt-2">
                            <Clock className="mr-2 h-3 w-3 opacity-70" />
                            <span className="text-xs text-muted-foreground">Active recently</span>
                          </div>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <Separator orientation="vertical" className="h-4 mx-1" />

                  {/* Author Info */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={post.author?.avatar} />
                      <AvatarFallback className="text-[8px]">
                        {post.author?.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold hover:underline cursor-pointer transition-all">
                      u/{post.author?.username || 'anon'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {/* Options Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2">
                      <Bookmark className="h-4 w-4" /> Save Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <UserPlus className="h-4 w-4" /> Follow Author
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                      <ExternalLink className="h-4 w-4" /> Open in New Tab
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                      <Flag className="h-4 w-4" /> Report Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer">
                {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-3">
              <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed">
                {post.content}
              </p>
            </CardContent>

            <CardFooter className="p-2 px-4 flex items-center gap-2 border-t border-border/30 bg-muted/5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:bg-primary/5 hover:text-primary">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs font-bold">{comments.length}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Discussion</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground">
                <Share2 className="h-4 w-4" />
                <span className="text-xs font-bold">Share</span>
              </Button>

              {/* Mobile Voting - Only visible on small screens */}
              <div className="sm:hidden flex items-center ml-auto bg-muted/50 rounded-full px-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-orange-600">
                  <ArrowBigUp className="h-4 w-4" />
                </Button>
                <span className="text-[10px] font-bold px-1 tabular-nums">{score}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-indigo-600">
                  <ArrowBigDown className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PostCard;