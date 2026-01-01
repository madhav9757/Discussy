import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, UserMinus, Loader2, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FollowUnfollowButton = ({
  targetUser,
  currentUserId,
  viewerFollowingIds,
  handleFollow,
  handleUnfollow,
  isLoadingFollow,
  isLoadingUnfollow
}) => {
  if (targetUser._id === currentUserId) return null;
  
  const isFollowing = viewerFollowingIds?.includes(targetUser._id);
  const isLoading = isLoadingFollow || isLoadingUnfollow;

  const handleClick = (e) => {
    e.preventDefault();
    if (isFollowing) {
      handleUnfollow(targetUser._id);
    } else {
      handleFollow(targetUser._id);
    }
  };

  return (
    <Button
      size="sm"
      variant={isFollowing ? "outline" : "default"}
      className={cn(
        "rounded-full px-4 font-bold transition-all h-8",
        isFollowing ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50" : "shadow-sm"
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isFollowing ? (
        <div className="flex items-center gap-1.5">
          <Check className="h-3 w-3" />
          <span>Following</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <UserPlus className="h-3 w-3" />
          <span>Follow</span>
        </div>
      )}
    </Button>
  );
};

const UserListModal = ({
  isOpen,
  onClose,
  title,
  users = [],
  currentUserId,
  viewerFollowingIds,
  followUser,
  unfollowUser,
  isLoadingFollow,
  isLoadingUnfollow
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center text-lg font-bold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {users && users.length > 0 ? (
              <div className="space-y-1">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Link to={`/user/${user._id}`} onClick={onClose}>
                        <Avatar className="h-10 w-10 border border-border/50">
                          <AvatarImage 
                            src={user.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} 
                          />
                          <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Link>
                      
                      <div className="flex flex-col">
                        <Link
                          to={`/user/${user._id}`}
                          className="text-sm font-bold hover:underline underline-offset-2 flex items-center gap-2"
                          onClick={onClose}
                        >
                          {user.username}
                          {user._id === currentUserId && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none">
                              You
                            </Badge>
                          )}
                        </Link>
                        {user.isCreator && (
                          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-emerald-500" />
                            Creator
                          </span>
                        )}
                      </div>
                    </div>

                    <FollowUnfollowButton
                      targetUser={user}
                      currentUserId={currentUserId}
                      viewerFollowingIds={viewerFollowingIds}
                      handleFollow={followUser}
                      handleUnfollow={unfollowUser}
                      isLoadingFollow={isLoadingFollow}
                      isLoadingUnfollow={isLoadingUnfollow}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="bg-muted rounded-full p-4 mb-4">
                  <UserPlus className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                  No {title.toLowerCase()} yet.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserListModal;