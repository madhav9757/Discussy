import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowBigUp, ArrowBigDown, Share2, MoreHorizontal, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useGetCommentsByPostIdQuery } from '../../app/api/commentsApi';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  // Using skip: !post._id to prevent unnecessary calls if ID is missing
  const { data: comments = [] } = useGetCommentsByPostIdQuery(post._id, { skip: !post._id });

  const handleNavigate = (e) => {
    // Prevent navigation if the user is clicking buttons (like upvote/share)
    if (e.target.closest('button')) return;
    navigate(`/posts/${post._id}`);
  };

  const score = (post.upvotes?.length || 0) - (post.downvotes?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card 
        className="group cursor-pointer border-border/60 bg-card hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden rounded-xl"
        onClick={handleNavigate}
      >
        <div className="flex">
          {/* Side Voting Bar (Desktop) */}
          <div className="hidden sm:flex flex-col items-center w-14 py-4 bg-muted/20 border-r border-border/40 group-hover:bg-muted/40 transition-colors">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-orange-600 hover:bg-orange-500/15 rounded-full"
            >
              <ArrowBigUp className="h-6 w-6 transition-transform group-hover:scale-110" />
            </Button>
            
            <span className={cn(
              "text-sm font-black py-2 tabular-nums",
              score > 0 ? "text-orange-600" : score < 0 ? "text-indigo-600" : "text-muted-foreground"
            )}>
              {score}
            </span>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/15 rounded-full"
            >
              <ArrowBigDown className="h-6 w-6 transition-transform group-hover:scale-110" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <CardHeader className="p-5 pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2.5 py-0.5 hover:bg-primary/10 transition-colors shrink-0">
                    d/{post.community?.name || 'general'}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium truncate">
                    <span className="hover:text-primary cursor-pointer transition-colors">u/{post.author?.username || 'anon'}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted hover:text-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Post Options</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <CardTitle className="text-xl font-bold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                {post.title || 'Untitled Post'}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-4">
              <p className="text-[15px] text-muted-foreground/90 line-clamp-3 leading-relaxed">
                {post.content || 'No content preview available.'}
              </p>
            </CardContent>

            <Separator className="bg-border/30 mx-5 w-auto" />

            <CardFooter className="p-3 px-5 flex items-center justify-between sm:justify-start gap-4">
              {/* Mobile Voting (Floating Pill Style) */}
              <div className="flex sm:hidden items-center bg-muted/60 rounded-full px-1 border border-border/50">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ArrowBigUp className="h-5 w-5" />
                </Button>
                <span className="text-xs font-bold px-1 tabular-nums">{score}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ArrowBigDown className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <MessageSquare className="h-3.5 w-3.5 text-primary fill-primary/20" />
                  </div>
                  <span className="text-xs font-bold">{comments.length} <span className="hidden xs:inline">Comments</span></span>
                </Button>

                <Button variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-foreground rounded-full">
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs font-bold hidden xs:inline">Share</span>
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