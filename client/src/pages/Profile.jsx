import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  useGetUserByIdQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation 
} from "../app/api/userApi";
import { useGetPostsByUserQuery } from "../app/api/postsApi";
import { useGetCommentsByUserQuery } from "../app/api/commentsApi";
import { Button } from "../components/ui/button";
import PostCard from "../components/PostCard";
import {
  User,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Loader2,
  Grid,
  MessageSquare,
  Settings,
  Hash,
  Users,
  ExternalLink,
  ArrowBigUp,
} from "lucide-react";
import { toast } from "sonner";

import EditProfileModal from "../components/EditProfileModal";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useGetUserByIdQuery(id, { skip: !id });

  const {
    data: posts,
    isLoading: postsLoading,
  } = useGetPostsByUserQuery(id, { skip: !id });

  const {
    data: userComments,
    isLoading: commentsLoading,
  } = useGetCommentsByUserQuery(id, { skip: !id || activeTab !== "comments" });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  const isOwnProfile = userInfo?._id === id;
  const isFollowingUser = user?.followers?.some(f => (f._id || f) === userInfo?._id);

  const handleFollowToggle = async () => {
    if (!userInfo) {
      toast.error("Please login to follow users");
      navigate("/login");
      return;
    }

    try {
      if (isFollowingUser) {
        await unfollowUser(id).unwrap();
        toast.success(`Unfollowed ${user.username}`);
      } else {
        await followUser(id).unwrap();
        toast.success(`Following ${user.username}`);
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to update follow status");
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (userError || !user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-3xl">
           <p className="text-destructive font-semibold">User Not Found</p>
           <p className="text-sm text-muted-foreground mt-1">The profile you're looking for doesn't exist or has been removed.</p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User size={24} className="text-primary" />
          {isOwnProfile ? "My Profile" : "Profile"}
        </h1>
        <div className="flex gap-3">
          {isOwnProfile ? (
            <Button
              variant="outline"
              className="h-9 px-5 rounded-full font-medium flex items-center gap-2"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Settings size={16} /> Edit Profile
            </Button>
          ) : (
            <>
              <Button
                onClick={handleFollowToggle}
                disabled={isFollowing || isUnfollowing}
                variant={isFollowingUser ? "outline" : "default"}
                className={`h-9 px-6 rounded-full font-medium transition-all ${isFollowingUser ? 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30' : ''}`}
              >
                {isFollowingUser ? "Unfollow" : "Follow"}
              </Button>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-full font-medium"
              >
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
      />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-80 space-y-6 shrink-0">
          <div className="border border-border/60 bg-card p-6 flex flex-col items-center justify-center space-y-5 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent h-32 z-0"></div>
            <div className="w-28 h-28 rounded-full border-4 border-card bg-muted flex items-center justify-center relative z-10 shadow-sm overflow-hidden mt-4">
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`}
                alt={user.username}
                className="w-full h-full p-2"
              />
            </div>

            <div className="text-center w-full border-b border-border/50 pb-5 relative z-10">
              <h1 className="text-2xl font-bold tracking-tight text-foreground/95">
                {user.username}
              </h1>
              <p className="text-sm text-muted-foreground/80 mt-1">
                @{user.username?.toLowerCase() || "user"}
              </p>
            </div>

            <div className="w-full flex justify-center gap-8 text-center pt-2 relative z-10">
              <div className="group cursor-pointer" onClick={() => setActiveTab("followers")}>
                <p className={`text-sm font-bold transition-colors ${activeTab === 'followers' ? 'text-primary' : 'text-foreground/90 group-hover:text-primary'}`}>
                  {user.followers?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Followers
                </p>
              </div>
              <div className="h-10 w-px bg-border/60"></div>
              <div className="group cursor-pointer" onClick={() => setActiveTab("following")}>
                <p className={`text-sm font-bold transition-colors ${activeTab === 'following' ? 'text-primary' : 'text-foreground/90 group-hover:text-primary'}`}>
                  {user.following?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Following
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border/60 bg-card p-6 space-y-5 rounded-3xl shadow-sm">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground/80 pb-2 border-b border-border/40">
                About
              </h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground pt-1">
                {user.bio || "This user hasn't added a bio yet."}
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground/90 pt-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="truncate">{user.location || "Earth"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-primary/70 shrink-0" /> 
                <span className="truncate">Joined {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
              </div>
              {user.website && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-primary/70 shrink-0" />
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline hover:text-primary transition-colors truncate"
                  >
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-border/60">
            {[
              { id: "posts", icon: <Grid className="w-4 h-4" />, label: "Posts" },
              { id: "comments", icon: <MessageSquare className="w-4 h-4" />, label: "Comments" },
              { id: "communities", icon: <Hash className="w-4 h-4" />, label: "Communities" },
              { id: "followers", icon: <Users className="w-4 h-4" />, label: "Followers" },
              { id: "following", icon: <Users className="w-4 h-4" />, label: "Following" },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm font-semibold border-b-2 pb-3 px-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeTab === "posts" && (
              postsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
                </div>
              ) : posts?.length > 0 ? (
                posts.map(post => <PostCard key={post._id} post={post} />)
              ) : (
                <div className="border border-border/60 bg-card rounded-3xl min-h-[300px] flex items-center justify-center shadow-sm">
                  <div className="text-center text-muted-foreground/80 p-8 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <Grid className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground/70 text-lg">No Posts</p>
                      <p className="text-sm mt-1">{isOwnProfile ? "You haven't" : "This user hasn't"} published anything yet.</p>
                    </div>
                  </div>
                </div>
              )
            )}

            {activeTab === "comments" && (
              <div className="space-y-3">
                {commentsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/30" />
                  </div>
                ) : userComments?.length > 0 ? (
                  userComments.map((comment) => (
                    <div
                      key={comment._id}
                      onClick={() => navigate(`/posts/${comment.postId?._id}`)}
                      className="group border border-border/60 bg-card rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                    >
                      {/* Post context pill */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {comment.postId?.community && (
                          <span className="text-[11px] font-black text-primary/80 bg-primary/8 px-2.5 py-0.5 rounded-full border border-primary/10">
                            c/{comment.postId.community.name}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-muted-foreground/80 truncate max-w-[300px]">
                          {comment.postId?.title || "Deleted post"}
                        </span>
                        <ExternalLink size={11} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors ml-auto shrink-0" />
                      </div>

                      {/* Comment body */}
                      <p className="text-[14px] text-foreground/85 leading-relaxed border-l-2 border-primary/30 pl-3">
                        {comment.content}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/60">
                        <span className="flex items-center gap-1">
                          <ArrowBigUp size={13} className="text-orange-400" />
                          {(comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)}
                        </span>
                        <span>
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {comment.parentId && (
                          <span className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-full font-medium">Reply</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-border/60 bg-card rounded-3xl min-h-[200px] flex items-center justify-center shadow-sm p-8">
                    <div className="text-center text-muted-foreground/70">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                      <p className="font-semibold">{isOwnProfile ? "You haven't" : "This user hasn't"} commented yet.</p>
                      <p className="text-sm mt-1">Jump into a discussion!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "communities" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.joinedCommunities?.length > 0 ? (
                  user.joinedCommunities.map((community) => (
                    <div key={community._id} onClick={() => navigate(`/communities/${community._id}`)} className="p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Hash size={20} />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground/90 truncate">c/{community.name}</p>
                          <p className="text-xs text-muted-foreground">Member</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full border border-border/60 bg-card rounded-3xl min-h-[200px] flex items-center justify-center shadow-sm italic text-muted-foreground text-sm p-8 text-center">
                    {isOwnProfile ? "You haven't joined any communities yet." : "This user hasn't joined any communities yet."}
                  </div>
                )}
              </div>
            )}

            {(activeTab === "followers" || activeTab === "following") && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(activeTab === "followers" ? user.followers : user.following)?.length > 0 ? (
                  (activeTab === "followers" ? user.followers : user.following).map((u) => (
                    <div key={u._id} onClick={() => navigate(`/profile/${u._id}`)} className="p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-4 group">
                       <div className="w-10 h-10 rounded-full bg-muted border border-border/40 overflow-hidden group-hover:scale-110 transition-transform">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.username}`} alt={u.username} className="w-full h-full p-1" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground/90 truncate">u/{u.username}</p>
                          <p className="text-xs text-muted-foreground truncate">View profile</p>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full border border-border/60 bg-card rounded-3xl min-h-[200px] flex items-center justify-center shadow-sm italic text-muted-foreground text-sm p-8 text-center">
                    No {activeTab} yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
