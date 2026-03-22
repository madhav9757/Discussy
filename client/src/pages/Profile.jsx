import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetUserByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../app/api/userApi";
import { useGetPostsByUserQuery } from "../app/api/postsApi";
import { useGetCommentsByUserQuery } from "../app/api/commentsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import { cn } from "@/lib/utils";
import {
  User,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Loader2,
  Grid3x3,
  MessageSquare,
  Settings,
  Hash,
  Users,
  ExternalLink,
  ArrowBigUp,
  UserPlus,
  UserMinus,
  MessageCircle,
  Globe,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

/* ── Stat pill ── */
const StatCard = ({ value, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center px-5 py-3 rounded-xl transition-all duration-150 cursor-pointer select-none",
      active
        ? "bg-foreground text-background"
        : "hover:bg-accent text-foreground",
    )}
  >
    <span className="text-lg font-black leading-none">{value}</span>
    <span
      className={cn(
        "text-[11px] font-semibold mt-1",
        active ? "text-background/70" : "text-muted-foreground",
      )}
    >
      {label}
    </span>
  </button>
);

/* ── Loading skeleton ── */
const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
    <Skeleton className="h-44 w-full rounded-2xl" />
    <div className="flex gap-6">
      <Skeleton className="h-72 w-72 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════ */
const Profile = () => {
  const { idOrUsername } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: user,
    isLoading: userLoading,
    isError,
  } = useGetUserByIdQuery(idOrUsername, { skip: !idOrUsername });
  const { data: posts, isLoading: postsLoading } = useGetPostsByUserQuery(idOrUsername, {
    skip: !idOrUsername,
  });
  const { data: userComments, isLoading: commentsLoading } =
    useGetCommentsByUserQuery(idOrUsername, {
      skip: !idOrUsername || activeTab !== "comments",
    });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] =
    useUnfollowUserMutation();

  const isOwnProfile = userInfo?._id === user?._id || userInfo?.username === idOrUsername;
  const isFollowingUser = user?.followers?.some(
    (f) => (f._id || f) === userInfo?._id,
  );

  const handleFollowToggle = async () => {
    if (!userInfo) {
      toast.error("Please login to follow users");
      navigate("/login");
      return;
    }
    try {
      if (isFollowingUser) {
        await unfollowUser(user._id).unwrap();
        toast.success(`Unfollowed ${user.username}`);
      } else {
        await followUser(user._id).unwrap();
        toast.success(`Now following ${user.username}`);
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to update follow status");
    }
  };

  /* ── Loading ── */
  if (userLoading) return <ProfileSkeleton />;

  /* ── Error ── */
  if (isError || !user)
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-destructive/60" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">User not found</p>
          <p className="text-sm text-muted-foreground mt-1">
            This profile doesn't exist or was removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="rounded-xl"
        >
          Return Home
        </Button>
      </div>
    );

  const TABS = [
    { id: "posts", Icon: Grid3x3, label: "Posts" },
    { id: "comments", Icon: MessageSquare, label: "Comments" },
    { id: "communities", Icon: Hash, label: "Communities" },
    { id: "followers", Icon: Users, label: "Followers" },
    { id: "following", Icon: Users, label: "Following" },
  ];

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-8 pb-20">
        <TooltipProvider>
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* ── Banner + Avatar row ── */}
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm">
          {/* Banner */}
          <div className="h-36 sm:h-44 bg-linear-to-br from-primary/20 via-primary/10 to-muted/40 relative">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          {/* Avatar + actions row */}
          <div className="px-5 sm:px-8 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10 sm:-mt-12">
              {/* Avatar */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-card bg-muted shadow-md overflow-hidden shrink-0">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-full h-full object-cover p-1"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:mb-1">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 px-4 font-semibold gap-2 text-[13px]"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Settings size={14} strokeWidth={2} />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleFollowToggle}
                      disabled={isFollowing || isUnfollowing}
                      size="sm"
                      variant={isFollowingUser ? "outline" : "default"}
                      className={cn(
                        "rounded-xl h-9 px-4 font-semibold gap-2 text-[13px] transition-all",
                        isFollowingUser &&
                          "hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5",
                      )}
                    >
                      {isFollowing || isUnfollowing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isFollowingUser ? (
                        <>
                          <UserMinus size={14} strokeWidth={2} /> Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} strokeWidth={2} /> Follow
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl h-9 px-4 font-semibold gap-2 text-[13px]"
                    >
                      <MessageCircle size={14} strokeWidth={2} />
                      <span className="hidden sm:inline">Message</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Name + bio */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  {user.username}
                </h1>
                {isOwnProfile && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  >
                    You
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                @{user.username?.toLowerCase()}
              </p>
              {user.bio && (
                <p className="text-sm text-foreground/80 leading-relaxed max-w-lg pt-1">
                  {user.bio}
                </p>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-[12.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-primary/60" />
                {user.location || "Earth"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-primary/60" />
                Joined{" "}
                {new Date(user.createdAt || Date.now()).toLocaleDateString(
                  undefined,
                  { month: "long", year: "numeric" },
                )}
              </span>
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary hover:underline transition-colors"
                >
                  <Globe size={13} className="text-primary/60" />
                  {user.website.replace(/^https?:\/\//, "")}
                  <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-1 mt-5 flex-wrap">
              <StatCard
                value={posts?.length || 0}
                label="Posts"
                onClick={() => setActiveTab("posts")}
                active={activeTab === "posts"}
              />
              <div className="w-px h-8 bg-border/50" />
              <StatCard
                value={user.followers?.length || 0}
                label="Followers"
                onClick={() => setActiveTab("followers")}
                active={activeTab === "followers"}
              />
              <div className="w-px h-8 bg-border/50" />
              <StatCard
                value={user.following?.length || 0}
                label="Following"
                onClick={() => setActiveTab("following")}
                active={activeTab === "following"}
              />
              <div className="w-px h-8 bg-border/50" />
              <StatCard
                value={user.joinedCommunities?.length || 0}
                label="Communities"
                onClick={() => setActiveTab("communities")}
                active={activeTab === "communities"}
              />
            </div>
          </div>
        </div>

        {/* ── Tabs + content ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab bar */}
          <TabsList className="w-full h-auto bg-card border border-border/50 rounded-xl p-1 flex gap-0.5 overflow-x-auto no-scrollbar shadow-sm">
            {TABS.map(({ id, Icon, label }) => (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(
                  "flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-2 rounded-lg flex-1 min-w-fit whitespace-nowrap transition-all duration-150",
                  "data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm",
                  "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
                )}
              >
                <Icon size={13} strokeWidth={2.2} />
                <span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Posts ── */}
          <TabsContent value="posts" className="mt-4 space-y-3">
            {postsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
              </div>
            ) : posts?.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <EmptyState
                Icon={Grid3x3}
                title="No posts yet"
                desc={
                  isOwnProfile
                    ? "Share your first post with the community!"
                    : "This user hasn't posted anything yet."
                }
                action={
                  isOwnProfile
                    ? { label: "Create Post", onClick: () => {} }
                    : null
                }
              />
            )}
          </TabsContent>

          {/* ── Comments ── */}
          <TabsContent value="comments" className="mt-4 space-y-3">
            {commentsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground/40" />
              </div>
            ) : userComments?.length > 0 ? (
              userComments.map((comment) => (
                <div
                  key={comment._id}
                  onClick={() => navigate(`/posts/${comment.postId?._id}`)}
                  className="group bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  {/* Post context */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {comment.postId?.community && (
                      <Badge
                        variant="secondary"
                        className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full"
                      >
                        c/{comment.postId.community.name}
                      </Badge>
                    )}
                    <span className="text-[12px] font-semibold text-muted-foreground truncate max-w-xs">
                      {comment.postId?.title || "Deleted post"}
                    </span>
                    <ExternalLink
                      size={11}
                      className="ml-auto text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0"
                    />
                  </div>

                  {/* Body */}
                  <p className="text-sm text-foreground/85 leading-relaxed border-l-2 border-primary/30 pl-3">
                    {comment.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/60">
                    <span className="flex items-center gap-1">
                      <ArrowBigUp size={13} className="text-orange-400" />
                      {(comment.upvotes?.length || 0) -
                        (comment.downvotes?.length || 0)}
                    </span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                    {comment.parentId && (
                      <Badge
                        variant="outline"
                        className="text-[9.5px] px-2 py-0.5 rounded-full font-semibold"
                      >
                        Reply
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                Icon={MessageSquare}
                title="No comments yet"
                desc={
                  isOwnProfile
                    ? "Jump into a discussion and leave your mark!"
                    : "This user hasn't commented yet."
                }
              />
            )}
          </TabsContent>

          {/* ── Communities ── */}
          <TabsContent value="communities" className="mt-4">
            {user.joinedCommunities?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.joinedCommunities.map((community) => (
                  <div
                    key={community._id}
                    onClick={() => navigate(`/communities/${community.name}`)}
                    className="group flex items-center gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Hash size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        c/{community.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Member
                      </p>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                Icon={Hash}
                title="No communities"
                desc={
                  isOwnProfile
                    ? "Find communities that interest you!"
                    : "This user hasn't joined any communities yet."
                }
                action={
                  isOwnProfile
                    ? {
                        label: "Explore Communities",
                        onClick: () => navigate("/communities"),
                      }
                    : null
                }
              />
            )}
          </TabsContent>

          {/* ── Followers / Following ── */}
          {["followers", "following"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {(() => {
                const list =
                  tab === "followers" ? user.followers : user.following;
                return list?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {list.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => navigate(`/profile/${u.username}`)}
                        className="group flex items-center gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border/40 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.username}`}
                            alt={u.username}
                            className="w-full h-full p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            u/{u.username}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            View profile →
                          </p>
                        </div>
                        <ChevronRight
                          size={15}
                          className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    Icon={Users}
                    title={`No ${tab} yet`}
                    desc={
                      tab === "followers"
                        ? isOwnProfile
                          ? "Share great content to grow your audience."
                          : "This user has no followers yet."
                        : isOwnProfile
                          ? "Find interesting people to follow!"
                          : "This user isn't following anyone yet."
                    }
                  />
                );
              })()}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
      />
        </TooltipProvider>
      </div>
    </div>
  );
};

/* ── Empty state helper ── */
const EmptyState = ({ Icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 bg-card border border-border/50 rounded-2xl text-center gap-4 min-h-[220px]">
    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center">
      <Icon className="w-7 h-7 text-muted-foreground/40" />
    </div>
    <div className="space-y-1">
      <p className="text-base font-bold text-foreground/80">{title}</p>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </div>
    {action && (
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl text-[13px] font-semibold mt-1"
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    )}
  </div>
);

export default Profile;
