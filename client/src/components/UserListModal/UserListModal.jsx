import React from "react";
import { Link } from "react-router-dom";
import { UserPlus, Loader2, Check } from "lucide-react";

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
  isLoadingUnfollow,
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
        "rounded-md px-3 font-bold transition-all h-7 text-[10px] uppercase tracking-tight",
        isFollowing ? "border-2" : "",
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
        <span>Follow</span>
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
  isLoadingUnfollow,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0 border-2">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-sm font-bold tracking-[0.2em] uppercase text-center">
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
                    className="flex items-center justify-between p-2 rounded-md transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Link to={`/user/${user._id}`} onClick={onClose}>
                        <Avatar className="h-9 w-9 rounded-md border">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="font-bold text-xs">
                            {user.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      <div className="flex flex-col">
                        <Link
                          to={`/user/${user._id}`}
                          className="text-xs font-bold hover:underline underline-offset-4 flex items-center gap-2"
                          onClick={onClose}
                        >
                          u/{user.username}
                          {user._id === currentUserId && (
                            <Badge
                              variant="secondary"
                              className="text-[8px] h-3.5 px-1 font-black uppercase tracking-tighter"
                            >
                              You
                            </Badge>
                          )}
                        </Link>
                        {user.isCreator && (
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
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
              <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  No {title.toLowerCase()} yet
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
