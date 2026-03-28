import React, { useState, useEffect } from "react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// customized components
import PostCard from "../components/PostCard";
import EditProfileModal from "../components/EditProfileModal";
import {
  cn,
  getAvatarUrl,
  getCommunityIconUrl,
  getUserBannerUrl,
} from "@/lib/utils";
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
  ArrowBigDown,
  UserPlus,
  UserMinus,
  MessageCircle,
  Globe,
  ChevronRight,
  MoreHorizontal,
  Share2,
  ShieldAlert,
  Flame,
  TrendingUp,
  Award,
  Sparkles,
  BookOpen,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */

/** Compute total karma from posts + comments */
const computeKarma = (posts = [], comments = []) => {
  const postKarma = posts.reduce(
    (acc, p) => acc + (p.upvotes?.length || 0) - (p.downvotes?.length || 0),
    0,
  );
  const commentKarma = comments.reduce(
    (acc, c) => acc + (c.upvotes?.length || 0) - (c.downvotes?.length || 0),
    0,
  );
  return postKarma + commentKarma;
};

/** Format large numbers: 1200 → 1.2k */
const fmt = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

/* ═══════════════════════════════════════════════════════
   STAT BOX
════════════════════════════════════════════════════════ */
const StatBox = ({ value, label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex flex-col items-center gap-1.5 p-3.5 rounded-2xl cursor-pointer",
      "border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      active
        ? "bg-primary/10 border-primary/25 shadow-[0_0_0_1px_hsl(var(--primary)/0.15)] text-primary"
        : "bg-muted/40 border-transparent hover:bg-muted/70 hover:border-border/60 text-foreground",
    )}
  >
    {Icon && (
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      />
    )}
    <span className="text-lg font-black tracking-tight leading-none tabular-nums">
      {fmt(value)}
    </span>
    <span
      className={cn(
        "text-[10px] font-semibold uppercase tracking-widest",
        active ? "text-primary/80" : "text-muted-foreground",
      )}
    >
      {label}
    </span>
  </button>
);

/* ═══════════════════════════════════════════════════════
   PROFILE SKELETON
════════════════════════════════════════════════════════ */
const ProfileSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto animate-pulse">
    <Skeleton className="h-52 md:h-64 w-full" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 -mt-16">
        <div className="lg:col-span-4 space-y-4 z-10">
          <Skeleton className="w-28 h-28 rounded-full border-4 border-background" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-8 space-y-4 mt-6">
          <Skeleton className="h-11 w-full rounded-xl" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════════════════════ */
const EmptyState = ({ Icon, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
    <div className="h-14 w-14 rounded-2xl bg-muted border border-border/50 flex items-center justify-center mb-4 shadow-sm">
      <Icon className="h-6 w-6 text-muted-foreground/60" />
    </div>
    <h3 className="text-base font-bold mb-1.5">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-xs mb-5">{desc}</p>
    {action && (
      <Button
        onClick={action.onClick}
        size="sm"
        className="rounded-xl font-semibold shadow-sm"
      >
        {action.label}
      </Button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   COMMENT CARD
════════════════════════════════════════════════════════ */
const CommentCard = ({ comment, onClick }) => {
  const voteScore =
    (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group overflow-hidden cursor-pointer transition-all duration-200",
        "border-border/40 hover:border-primary/30 hover:shadow-md",
        "bg-card/60 backdrop-blur-sm",
      )}
    >
      <CardContent className="p-0">
        {/* Post context header */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-center gap-2.5 border-b border-border/30 bg-muted/20">
          <div className="w-7 h-7 rounded-lg bg-muted border border-border/30 overflow-hidden shrink-0">
            <img
              src={getCommunityIconUrl(comment.postId?.community)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 flex-1">
            <Link
              to={`/communities/${comment.postId?.community?.name}`}
              onClick={(e) => e.stopPropagation()}
              className="font-bold text-foreground/80 hover:text-primary transition-colors truncate"
            >
              c/{comment.postId?.community?.name || "unknown"}
            </Link>
            <span className="opacity-30 shrink-0">·</span>
            <span className="truncate">
              {comment.postId?.title || "Deleted post"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Comment body */}
        <div className="px-4 py-3 flex gap-3 items-start">
          <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
            <ChevronUp
              className={cn(
                "h-4 w-4",
                voteScore > 0 ? "text-orange-500" : "text-muted-foreground/40",
              )}
            />
            <span
              className={cn(
                "text-[11px] font-black tabular-nums",
                voteScore > 0
                  ? "text-orange-500"
                  : voteScore < 0
                    ? "text-blue-500"
                    : "text-muted-foreground",
              )}
            >
              {voteScore}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85 line-clamp-3">
            {comment.content}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/* ═══════════════════════════════════════════════════════
   USER CARD  (followers / following)
════════════════════════════════════════════════════════ */
const UserCard = ({ u, onClick }) => (
  <Card
    onClick={onClick}
    className="group cursor-pointer border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card/60"
  >
    <CardContent className="p-4 flex items-center gap-3">
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full border-2 border-background ring-1 ring-border/30 overflow-hidden shadow-sm">
          <img
            src={getAvatarUrl(u)}
            alt={u.username}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        {/* online indicator placeholder */}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm truncate group-hover:text-primary transition-colors">
          {u.username}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          @{u.username?.toLowerCase()}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </CardContent>
  </Card>
);

/* ═══════════════════════════════════════════════════════
   COMMUNITY CARD
════════════════════════════════════════════════════════ */
const CommunityCard = ({ community, isFounder, onClick }) => (
  <Card
    onClick={onClick}
    className="group cursor-pointer border-border/40 hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card/60 overflow-hidden"
  >
    <CardContent className="p-4 flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-xl bg-muted border border-border/20 overflow-hidden shrink-0 shadow-sm">
        <img
          src={getCommunityIconUrl(community)}
          alt={community.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-sm truncate group-hover:text-primary transition-colors">
          c/{community.name}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge
            variant="outline"
            className={cn(
              "h-4 px-1.5 text-[9px] font-bold uppercase tracking-wider border",
              isFounder
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                : "bg-primary/5 text-primary/80 border-primary/15",
            )}
          >
            {isFounder ? "Founder" : "Member"}
          </Badge>
          {community.memberCount != null && (
            <span className="text-[10px] text-muted-foreground font-medium">
              {fmt(community.memberCount)} members
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
    </CardContent>
  </Card>
);

/* ═══════════════════════════════════════════════════════
   MAIN PROFILE PAGE
════════════════════════════════════════════════════════ */
const Profile = () => {
  const { idOrUsername } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followHover, setFollowHover] = useState(false);

  /* ── API ── */
  const {
    data: user,
    isLoading: userLoading,
    isError,
  } = useGetUserByIdQuery(idOrUsername, { skip: !idOrUsername });

  const { data: posts = [], isLoading: postsLoading } = useGetPostsByUserQuery(
    idOrUsername,
    { skip: !idOrUsername },
  );

  const { data: userComments = [], isLoading: commentsLoading } =
    useGetCommentsByUserQuery(idOrUsername, {
      skip: !idOrUsername || activeTab !== "comments",
    });

  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] =
    useUnfollowUserMutation();

  /* ── Derived ── */
  const isOwnProfile =
    userInfo?._id === user?._id || userInfo?.username === idOrUsername;

  const isFollowingUser = user?.followers?.some(
    (f) => (f._id || f) === userInfo?._id,
  );

  const karma = computeKarma(posts, userComments);

  const allCommunities = React.useMemo(() => {
    const combined = [
      ...(user?.createdCommunities || []),
      ...(user?.joinedCommunities || []),
    ];
    const seen = new Set();
    return combined.filter((c) => {
      if (!c?._id || seen.has(c._id)) return false;
      seen.add(c._id);
      return true;
    });
  }, [user?.createdCommunities, user?.joinedCommunities]);

  /* ── Handlers ── */
  const handleFollowToggle = async () => {
    if (!userInfo) {
      toast.error("Please log in to follow users");
      navigate("/login");
      return;
    }
    try {
      if (isFollowingUser) {
        await unfollowUser(user._id).unwrap();
        toast.success(`Unfollowed ${user.username}`);
      } else {
        await followUser(user._id).unwrap();
        toast.success(`Now following ${user.username}! 🎉`);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update follow status");
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  /* ── Tab definitions ── */
  const TABS = [
    {
      id: "posts",
      Icon: Grid3x3,
      label: "Posts",
      count: posts.length,
    },
    {
      id: "comments",
      Icon: MessageSquare,
      label: "Comments",
      count: userComments.length || undefined,
    },
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
      count: user?.followers?.length || 0,
    },
    {
      id: "following",
      Icon: User,
      label: "Following",
      count: user?.following?.length || 0,
    },
  ];

  /* ── Error ── */
  if (isError && !userLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-20 h-20 rounded-3xl bg-muted border border-border/50 flex items-center justify-center">
          <User className="w-9 h-9 text-muted-foreground/60" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black mb-1">User not found</h2>
          <p className="text-sm text-muted-foreground">
            This account doesn't exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  if (userLoading) return <ProfileSkeleton />;

  const hasBanner = !!getUserBannerUrl(user);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background pb-24">
        {/* ══════════════════════════════════════
            BANNER
        ══════════════════════════════════════ */}
        <div className="relative w-full h-44 md:h-56 overflow-hidden">
          {hasBanner ? (
            <img
              src={getUserBannerUrl(user)}
              alt="profile banner"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-primary/10 to-background">
              {/* Subtle dot-grid texture */}
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
            </div>
          )}
          {/* Bottom fade so content blends into page */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background to-transparent" />
        </div>

        {/* ══════════════════════════════════════
            MAIN GRID
        ══════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ────────────────────────────────────
                LEFT SIDEBAR
            ──────────────────────────────────── */}
            <aside className="lg:col-span-4 -mt-14 md:-mt-20 z-10 relative space-y-4">
              {/* ── Profile Card ── */}
              <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur-md overflow-visible">
                <CardContent className="pt-5 pb-5 px-5 space-y-4">
                  {/* Avatar row */}
                  <div className="flex items-end justify-between">
                    <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-background shadow-2xl ring-2 ring-border/40">
                      <AvatarImage
                        src={getAvatarUrl(user)}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-3xl font-black bg-primary/10 text-primary">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Actions cluster */}
                    <div className="flex items-center gap-2 pb-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={copyProfileLink}>
                            <Share2 className="mr-2 h-3.5 w-3.5" />
                            Share Profile
                          </DropdownMenuItem>
                          {!isOwnProfile && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <ShieldAlert className="mr-2 h-3.5 w-3.5" />
                                Report User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Name + badges */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-black tracking-tight">
                        {user.displayName || user.username}
                      </h1>
                      {isOwnProfile && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-widest"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mt-0.5">
                      @{user.username?.toLowerCase()}
                    </p>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {user.bio}
                    </p>
                  )}

                  <Separator className="opacity-50" />

                  {/* Meta */}
                  <div className="space-y-2">
                    {user.location && (
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate">{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary/60" />
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
                      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <a
                          href={
                            user.website.startsWith("http")
                              ? user.website
                              : `https://${user.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {user.website.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Karma chip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-default w-fit">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-sm font-black text-amber-600 tabular-nums">
                          {fmt(karma)}
                        </span>
                        <span className="text-xs text-amber-600/70 font-semibold">
                          karma
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Total post + comment karma</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* CTA buttons */}
                  <div
                    className={cn(
                      "grid gap-2.5",
                      isOwnProfile ? "grid-cols-1" : "grid-cols-2",
                    )}
                  >
                    {isOwnProfile ? (
                      <Button
                        onClick={() => setIsEditOpen(true)}
                        className="w-full rounded-xl font-bold shadow-sm"
                        size="sm"
                      >
                        <Settings className="mr-2 h-3.5 w-3.5" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleFollowToggle}
                          onMouseEnter={() => setFollowHover(true)}
                          onMouseLeave={() => setFollowHover(false)}
                          disabled={isFollowing || isUnfollowing}
                          variant={isFollowingUser ? "outline" : "default"}
                          size="sm"
                          className={cn(
                            "rounded-xl font-bold shadow-sm transition-all",
                            isFollowingUser &&
                              followHover &&
                              "border-destructive/60 text-destructive hover:bg-destructive/5",
                          )}
                        >
                          {isFollowing || isUnfollowing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isFollowingUser ? (
                            <>
                              {followHover ? (
                                <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                              ) : (
                                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              {followHover ? "Unfollow" : "Following"}
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-bold shadow-sm hover:bg-primary/5 hover:border-primary/30"
                        >
                          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ── Stats Grid ── */}
              <div className="grid grid-cols-2 gap-2.5">
                <StatBox
                  value={posts.length}
                  label="Posts"
                  icon={BookOpen}
                  active={activeTab === "posts"}
                  onClick={() => setActiveTab("posts")}
                />
                <StatBox
                  value={allCommunities.length}
                  label="Communities"
                  icon={Hash}
                  active={activeTab === "communities"}
                  onClick={() => setActiveTab("communities")}
                />
                <StatBox
                  value={user.followers?.length || 0}
                  label="Followers"
                  icon={Users}
                  active={activeTab === "followers"}
                  onClick={() => setActiveTab("followers")}
                />
                <StatBox
                  value={user.following?.length || 0}
                  label="Following"
                  icon={UserPlus}
                  active={activeTab === "following"}
                  onClick={() => setActiveTab("following")}
                />
              </div>
            </aside>

            {/* ────────────────────────────────────
                RIGHT MAIN CONTENT
            ──────────────────────────────────── */}
            <main className="lg:col-span-8 mt-0 lg:mt-6 space-y-5">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                {/* Tab bar */}
                <TabsList className="w-full justify-start h-auto p-1 bg-card border border-border/50 shadow-sm rounded-2xl overflow-x-auto scrollbar-hide flex-nowrap">
                  {TABS.map(({ id, Icon, label, count }) => (
                    <TabsTrigger
                      key={id}
                      value={id}
                      className={cn(
                        "flex items-center gap-1.5 py-2 px-3.5 rounded-xl shrink-0",
                        "text-sm font-semibold transition-all duration-150",
                        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
                        "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-muted/60",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{label}</span>
                      {count !== undefined && (
                        <span
                          className={cn(
                            "text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md",
                            "data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground",
                            "bg-muted text-muted-foreground",
                          )}
                        >
                          {fmt(count)}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── Posts ── */}
                <TabsContent value="posts" className="mt-5 space-y-3">
                  {postsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
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
                          ? {
                              label: "Create Post",
                              onClick: () => navigate("/submit"),
                            }
                          : null
                      }
                    />
                  )}
                </TabsContent>

                {/* ── Comments ── */}
                <TabsContent value="comments" className="mt-5 space-y-3">
                  {commentsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : userComments.length > 0 ? (
                    userComments.map((comment) => (
                      <CommentCard
                        key={comment._id}
                        comment={comment}
                        onClick={() => navigate(`/post/${comment.postId?._id}`)}
                      />
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
                <TabsContent value="communities" className="mt-5">
                  {allCommunities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {allCommunities.map((community) => {
                        const isFounder = (user.createdCommunities || []).some(
                          (c) => c._id === community._id,
                        );
                        return (
                          <CommunityCard
                            key={community._id}
                            community={community}
                            isFounder={isFounder}
                            onClick={() =>
                              navigate(`/communities/${community.name}`)
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      Icon={Hash}
                      title="No communities"
                      desc={
                        isOwnProfile
                          ? "Find and join communities that interest you!"
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
                  <TabsContent key={tab} value={tab} className="mt-5">
                    {(() => {
                      const list =
                        tab === "followers" ? user.followers : user.following;
                      return list?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {list.map((u) => (
                            <UserCard
                              key={u._id}
                              u={u}
                              onClick={() => navigate(`/profile/${u.username}`)}
                            />
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
                                ? "Explore and find interesting people to follow."
                                : "This user isn't following anyone yet."
                          }
                        />
                      );
                    })()}
                  </TabsContent>
                ))}
              </Tabs>
            </main>
          </div>
        </div>

        {/* Edit profile modal */}
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
        />
      </div>
    </TooltipProvider>
  );
};

export default Profile;
