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

// ui components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// customized components
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import { cn, getAvatarUrl, getCommunityIconUrl, getUserBannerUrl } from "@/lib/utils";
import { toast } from "sonner";

// icons
import {
  User,
  MapPin,
  CalendarDays,
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
  MoreHorizontal,
  Share2,
  ShieldAlert,
  Link as LinkIcon,
  Flame,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

/* ── Stat Box ── */
const StatBox = ({ value, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all duration-200 border",
      active
        ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
        : "bg-card border-transparent hover:bg-accent hover:border-border text-foreground",
    )}
  >
    <span className="text-xl font-bold tracking-tight leading-none mb-1">
      {value}
    </span>
    <span
      className={cn(
        "text-[11px] font-medium uppercase tracking-wider",
        active ? "text-primary/80" : "text-muted-foreground",
      )}
    >
      {label}
    </span>
  </div>
);

/* ── Loading Skeleton ── */
const ProfileSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-pulse">
    <Skeleton className="h-48 md:h-64 w-full rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6 -mt-20 z-10">
        <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="lg:col-span-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
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

  const { data: posts, isLoading: postsLoading } = useGetPostsByUserQuery(
    idOrUsername,
    { skip: !idOrUsername },
  );

  const { data: userComments, isLoading: commentsLoading } =
    useGetCommentsByUserQuery(idOrUsername, {
      skip: !idOrUsername || activeTab !== "comments",
    });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] =
    useUnfollowUserMutation();

  const isOwnProfile =
    userInfo?._id === user?._id || userInfo?.username === idOrUsername;
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

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard");
  };

  const allCommunities = React.useMemo(() => {
    const combined = [
      ...(user?.createdCommunities || []),
      ...(user?.joinedCommunities || []),
    ];
    // De-duplicate by _id
    const unique = [];
    const seen = new Set();
    combined.forEach((c) => {
      if (c && c._id && !seen.has(c._id)) {
        seen.add(c._id);
        unique.push(c);
      }
    });
    return unique;
  }, [user?.createdCommunities, user?.joinedCommunities]);

  if (isError && !userLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <User className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p className="text-muted-foreground">
            This account doesn't exist or has been removed.
          </p>
        </div>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Home
        </Button>
      </div>
    );
  }

  if (userLoading) return <ProfileSkeleton />;

  const TABS = [
    { id: "posts", Icon: Grid3x3, label: "Posts", count: posts?.length || 0 },
    { id: "comments", Icon: MessageSquare, label: "Comments" },
    {
      id: "communities",
      Icon: Hash,
      label: "Communities",
      count: allCommunities.length,
    },
    {
      id: "followers",
      Icon: Users,
      label: "Followers",
      count: user.followers?.length || 0,
    },
    {
      id: "following",
      Icon: User,
      label: "Following",
      count: user.following?.length || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Banner ── */}
      <div
        className={`w-full h-[25vh] md:h-[30vh] ${!getUserBannerUrl(user) && "bg-linear-to-tr from-primary/80 via-primary/40 to-muted"} relative border-b overflow-hidden`}
        style={
          getUserBannerUrl(user)
            ? {
                backgroundImage: `url("${getUserBannerUrl(user)}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {!user.bannerImage && (
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Sidebar (Profile Info) ── */}
          <div className="lg:col-span-4 lg:col-start-1 -mt-16 md:-mt-24 z-10 relative space-y-6">
            <Card className="border-none shadow-lg bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/75">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 sm:gap-6 lg:gap-4">
                  {/* Avatar */}
                  <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background shadow-xl ring-2 ring-border/50 bg-muted">
                    <AvatarImage
                      src={getAvatarUrl(user)}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info & Actions Container */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-start justify-between w-full gap-2">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                          {user.username}
                          {isOwnProfile && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5"
                            >
                              YOU
                            </Badge>
                          )}
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1 mt-1">
                          @{user.username?.toLowerCase()}
                        </p>
                      </div>

                      {/* Dropdown Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={copyProfileLink}>
                            <Share2 className="mr-2 h-4 w-4" /> Share Profile
                          </DropdownMenuItem>
                          {!isOwnProfile && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <ShieldAlert className="mr-2 h-4 w-4" /> Report
                                User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {user.bio && (
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {user.bio}
                      </p>
                    )}

                    {/* Meta Details */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary/70" />
                        <span>{user.location || "Location hidden"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 text-primary/70" />
                        <span>
                          Joined{" "}
                          {new Date(
                            user.createdAt || Date.now(),
                          ).toLocaleDateString(undefined, {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {user.website && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 text-primary/70" />
                          <a
                            href={user.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            {user.website.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Primary Actions */}
                    <div className="pt-4 grid grid-cols-2 gap-3 w-full">
                      {isOwnProfile ? (
                        <Button
                          onClick={() => setIsEditOpen(true)}
                          className="col-span-2 shadow-sm font-semibold"
                        >
                          <Settings className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleFollowToggle}
                            disabled={isFollowing || isUnfollowing}
                            variant={isFollowingUser ? "outline" : "default"}
                            className={cn(
                              "shadow-sm font-semibold transition-all",
                              isFollowingUser &&
                                "hover:border-destructive hover:text-destructive",
                            )}
                          >
                            {isFollowing || isUnfollowing ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : isFollowingUser ? (
                              <>
                                <UserMinus className="mr-2 h-4 w-4" /> Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" /> Follow
                              </>
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            className="shadow-sm font-semibold"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" /> Message
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox
                value={posts?.length || 0}
                label="Posts"
                active={activeTab === "posts"}
                onClick={() => setActiveTab("posts")}
              />
              <StatBox
                value={user.joinedCommunities?.length || 0}
                label="Communities"
                active={activeTab === "communities"}
                onClick={() => setActiveTab("communities")}
              />
              <StatBox
                value={user.followers?.length || 0}
                label="Followers"
                active={activeTab === "followers"}
                onClick={() => setActiveTab("followers")}
              />
              <StatBox
                value={user.following?.length || 0}
                label="Following"
                active={activeTab === "following"}
                onClick={() => setActiveTab("following")}
              />
            </div>
          </div>

          {/* ── Right Main Content (Tabs) ── */}
          <div className="lg:col-span-8 lg:mt-8 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start h-auto p-1 bg-card border shadow-sm rounded-xl overflow-x-auto custom-scrollbar flex-nowrap">
                {TABS.map(({ id, Icon, label, count }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all shrink-0"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold">{label}</span>
                    {count !== undefined && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 h-5 px-1.5 bg-background/20 hover:bg-background/20 data-[state=active]:text-primary-foreground border-none"
                      >
                        {count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content Wrappers with Animation */}
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* ── Posts ── */}
                <TabsContent value="posts" className="m-0 space-y-4">
                  {postsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
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
                <TabsContent value="comments" className="m-0 space-y-4">
                  {commentsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                    </div>
                  ) : userComments?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {userComments.map((comment) => (
                        <Card
                          key={comment._id}
                          className="group overflow-hidden border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer bg-card/50"
                          onClick={() =>
                            navigate(`/post/${comment.postId?._id}`)
                          }
                        >
                          <div className="p-5 flex gap-4">
                            {/* Left: Community Icon */}
                            <div className="shrink-0 pt-0.5">
                              <div className="w-9 h-9 rounded-xl bg-muted border border-border/10 overflow-hidden flex items-center justify-center shadow-xs">
                                <img
                                  src={getCommunityIconUrl(
                                    comment.postId?.community,
                                  )}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                              </div>
                            </div>

                            {/* Right: Content */}
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                  <Link
                                    to={`/communities/${comment.postId?.community?.name}`}
                                    className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    c/{comment.postId?.community?.name}
                                  </Link>
                                  <span className="opacity-30">•</span>
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(comment.createdAt),
                                      { addSuffix: true },
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-full border border-border/10">
                                  <ArrowBigUp className="h-3.5 w-3.5 text-orange-500" />
                                  <span className="text-[10px] font-black">
                                    {(comment.upvotes?.length || 0) -
                                      (comment.downvotes?.length || 0)}
                                  </span>
                                </div>
                              </div>

                              <h4 className="text-[13px] font-bold text-foreground/70 group-hover:text-primary transition-colors line-clamp-1">
                                Re: {comment.postId?.title || "Deleted post"}
                              </h4>

                              <div className="relative">
                                <p className="text-[14px] leading-relaxed text-foreground/90 font-medium pl-4 border-l-2 border-primary/20 group-hover:border-primary transition-colors line-clamp-3 italic">
                                  "{comment.content}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
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
                <TabsContent value="communities" className="m-0">
                  {allCommunities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allCommunities.map((community) => {
                        const isFounder = (user.createdCommunities || []).some(
                          (c) => c._id === community._id,
                        );
                        return (
                          <Card
                            key={community._id}
                            className="group relative overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50"
                            onClick={() =>
                              navigate(`/communities/${community.name}`)
                            }
                          >
                            <CardContent className="p-5 flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-muted border border-border/10 overflow-hidden flex items-center justify-center shadow-xs">
                                <img
                                  src={getCommunityIconUrl(community)}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-base truncate group-hover:text-primary transition-colors tracking-tight">
                                  c/{community.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider",
                                      isFounder
                                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                        : "bg-primary/5 text-primary border-primary/10",
                                    )}
                                  >
                                    {isFounder ? "Founder" : "Member"}
                                  </Badge>
                                  <span className="text-[11px] text-muted-foreground font-medium">
                                    Join Date:{" "}
                                    {new Date(
                                      community.createdAt || Date.now(),
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
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
                  <TabsContent key={tab} value={tab} className="m-0">
                    {(() => {
                      const list =
                        tab === "followers" ? user.followers : user.following;
                      return list?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {list.map((u) => (
                            <Card
                              key={u._id}
                              className="group relative overflow-hidden border-border/40 hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50"
                              onClick={() => navigate(`/profile/${u.username}`)}
                            >
                              <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-background ring-1 ring-border/20 overflow-hidden shadow-sm">
                                  <img
                                    src={getAvatarUrl(u)}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-black text-base truncate group-hover:text-primary transition-colors tracking-tight">
                                    {u.username}
                                  </h3>
                                  <p className="text-xs text-muted-foreground font-medium truncate">
                                    @{u.username.toLowerCase()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-primary/5 group-hover:text-primary transition-all"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </CardContent>
                            </Card>
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
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
      />
    </div>
  );
};

/* ── Refined Empty State Component ── */
const EmptyState = ({ Icon, title, desc, action }) => (
  <Card className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed border-2 bg-muted/30 shadow-none">
    <div className="h-16 w-16 rounded-full bg-background border shadow-sm flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-muted-foreground/60" />
    </div>
    <CardTitle className="text-lg mb-2">{title}</CardTitle>
    <CardDescription className="max-w-sm mb-6 text-sm">{desc}</CardDescription>
    {action && (
      <Button onClick={action.onClick} variant="default" className="shadow-sm">
        {action.label}
      </Button>
    )}
  </Card>
);

export default Profile;
