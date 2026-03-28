import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useDeleteCommunityMutation,
} from "../app/api/communitiesApi";
import PostCard from "../components/PostCard";
import { CreatePostModal } from "../components/modals/CreatePostModal";
import EditCommunityModal from "../components/modals/EditCommunityModal";
import {
  Hash,
  Users,
  Calendar,
  LayoutGrid,
  Loader2,
  Settings,
  LogOut,
  Trash2,
  Tag,
  PenSquare,
  Crown,
  UserCheck,
  ChevronRight,
  Info,
  Shield,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  getAvatarUrl,
  getCommunityIconUrl,
  getCommunityBannerUrl,
  cn,
} from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */
const fmt = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n ?? 0);
};

/** Deterministic banner gradient based on community name */
const BANNER_GRADIENTS = [
  "from-violet-600/25 via-purple-500/10 to-indigo-600/20",
  "from-emerald-500/25 via-teal-500/10 to-cyan-600/20",
  "from-orange-500/25 via-amber-500/10 to-yellow-500/20",
  "from-pink-500/25 via-rose-500/10 to-red-500/20",
  "from-blue-500/25 via-sky-500/10 to-cyan-500/20",
  "from-lime-500/25 via-green-500/10 to-emerald-500/20",
];
const getBannerGradient = (name = "") =>
  BANNER_GRADIENTS[name.charCodeAt(0) % BANNER_GRADIENTS.length];

/* ═══════════════════════════════════════════════════════
   LOADING SKELETON
════════════════════════════════════════════════════════ */
const CommunityProfileSkeleton = () => (
  <div className="w-full animate-pulse space-y-6 px-6 py-6">
    <Skeleton className="h-44 md:h-52 w-full rounded-2xl" />
    <div className="flex items-end gap-4 -mt-10">
      <Skeleton className="w-20 h-20 rounded-2xl border-4 border-background" />
      <div className="space-y-2 pb-1 flex-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>
    <div className="flex gap-5">
      <div className="w-60 space-y-3 shrink-0">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-10 rounded-xl" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   STAT CHIP
════════════════════════════════════════════════════════ */
const StatChip = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
    <Icon className="w-3.5 h-3.5 text-primary/50 shrink-0" />
    <span>
      <span className="font-black text-foreground tabular-nums">
        {fmt(value)}
      </span>{" "}
      {label}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MEMBER CARD
════════════════════════════════════════════════════════ */
const MemberCard = ({ member, isFounder }) => (
  <Link
    to={`/profile/${member.username}`}
    className="group flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/70 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
  >
    <Avatar className="w-9 h-9 rounded-xl border border-border/30 shrink-0">
      <AvatarImage
        src={getAvatarUrl(member)}
        alt={member.username}
        className="object-cover"
      />
      <AvatarFallback className="rounded-xl text-xs font-bold bg-primary/10 text-primary">
        {member.username?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
        u/{member.username}
      </p>
      {isFounder && (
        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest flex items-center gap-0.5">
          <Crown className="w-2.5 h-2.5" />
          Founder
        </p>
      )}
    </div>
    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
  </Link>
);

/* ═══════════════════════════════════════════════════════
   EMPTY POSTS STATE
════════════════════════════════════════════════════════ */
const EmptyPosts = ({ isMember, community, handleJoin, joining }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
    <div className="w-14 h-14 rounded-2xl bg-muted border border-border/40 flex items-center justify-center mb-4">
      <Sparkles className="w-6 h-6 text-muted-foreground/40" />
    </div>
    <h3 className="text-base font-bold mb-1.5">Quiet in here…</h3>
    <p className="text-sm text-muted-foreground mb-5 max-w-xs">
      Be the first to spark a conversation in this community.
    </p>
    {isMember ? (
      <CreatePostModal defaultCommunity={community._id}>
        <Button
          size="sm"
          className="rounded-xl px-5 h-8 text-xs font-bold gap-1.5 shadow-sm"
        >
          <PenSquare className="w-3.5 h-3.5" />
          Create First Post
        </Button>
      </CreatePostModal>
    ) : (
      <Button
        size="sm"
        onClick={handleJoin}
        disabled={joining}
        className="rounded-xl px-5 h-8 text-xs font-bold gap-1.5 shadow-sm"
      >
        {joining ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Users className="w-3.5 h-3.5" />
        )}
        Join to Post
      </Button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
const CommunityProfile = () => {
  const { idOrName } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditOpen, setIsEditOpen] = useState(false);

  /* ── API ── */
  const {
    data: community,
    isLoading,
    isError,
  } = useGetCommunityByIdQuery(idOrName, { skip: !idOrName });

  const [joinCommunity, { isLoading: joining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: leaving }] = useLeaveCommunityMutation();
  const [deleteCommunity, { isLoading: deleting }] =
    useDeleteCommunityMutation();

  /* ── Derived ── */
  const isMember = useMemo(
    () =>
      community?.members?.some(
        (m) => (m._id || m)?.toString() === userInfo?._id?.toString(),
      ),
    [community?.members, userInfo?._id],
  );

  const isCreator = useMemo(
    () =>
      (community?.createdBy?._id || community?.createdBy)?.toString() ===
      userInfo?._id?.toString(),
    [community?.createdBy, userInfo?._id],
  );

  const posts = community?.posts || [];
  const memberCount = community?.members?.length || 0;
  const postCount = posts.length;
  const hasBanner = !!getCommunityBannerUrl(community);

  /* ── Handlers ── */
  const handleJoin = async () => {
    if (!userInfo) {
      toast.error("Please log in to join communities");
      navigate("/login");
      return;
    }
    try {
      await joinCommunity(community._id).unwrap();
      toast.success(`Joined c/${community.name}! 🎉`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to join");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity(community._id).unwrap();
      toast.success(`Left c/${community.name}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to leave");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommunity(community._id).unwrap();
      toast.success("Community deleted");
      navigate("/communities");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  /* ── States ── */
  if (isLoading) return <CommunityProfileSkeleton />;

  if (isError || !community) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-5 px-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/8 border border-destructive/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-destructive/70" />
        </div>
        <div>
          <h2 className="text-lg font-black mb-1.5">Community Not Found</h2>
          <p className="text-sm text-muted-foreground">
            This community doesn't exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/communities")}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          Browse Communities
        </Button>
      </div>
    );
  }

  const TABS = [
    { id: "posts", Icon: LayoutGrid, label: "Feed", count: postCount },
    { id: "members", Icon: Users, label: "People", count: memberCount },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 space-y-5">
            {/* ══════════════════════════════════════
                BANNER
            ══════════════════════════════════════ */}
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden border border-border/30 h-40 md:h-52 shadow-sm",
                !hasBanner &&
                  `bg-linear-to-br ${getBannerGradient(community.name)}`,
              )}
              style={
                hasBanner
                  ? {
                      backgroundImage: `url("${getCommunityBannerUrl(community)}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >
              {/* Subtle dot texture */}
              {!hasBanner && (
                <div
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1.5px 1.5px, currentColor 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                  }}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background/50 to-transparent" />
            </div>

            {/* ══════════════════════════════════════
                COMMUNITY HEADER
            ══════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-12 relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl border-4 border-background bg-muted overflow-hidden shadow-xl shrink-0">
                <img
                  src={getCommunityIconUrl(community)}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name + badges + actions */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 pt-8 sm:pt-0 sm:pb-1">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-black tracking-tight truncate">
                      c/{community.name}
                    </h1>
                    {isCreator && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-5 px-1.5 font-black uppercase tracking-widest gap-0.5 text-amber-500 border-amber-500/25 bg-amber-500/8"
                      >
                        <Crown className="w-2.5 h-2.5" />
                        Founder
                      </Badge>
                    )}
                    {isMember && !isCreator && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-5 px-1.5 font-black uppercase tracking-widest gap-0.5 text-primary border-primary/25 bg-primary/8"
                      >
                        <UserCheck className="w-2.5 h-2.5" />
                        Member
                      </Badge>
                    )}
                  </div>
                  {community.category && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground font-semibold">
                      <Tag className="w-3 h-3" />
                      {community.category}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                  {isMember && (
                    <CreatePostModal defaultCommunity={community._id}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3.5 rounded-xl font-bold gap-1.5 border-border/50 text-xs hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                        New Post
                      </Button>
                    </CreatePostModal>
                  )}

                  {/* Join / Leave */}
                  {userInfo &&
                    !isCreator &&
                    (isMember ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLeave}
                        disabled={leaving}
                        className="h-8 px-3.5 rounded-xl font-bold gap-1.5 text-xs border-border/50 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                      >
                        {leaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogOut className="w-3.5 h-3.5" />
                        )}
                        Leave
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleJoin}
                        disabled={joining}
                        className="h-8 px-4 rounded-xl font-bold gap-1.5 text-xs shadow-sm"
                      >
                        {joining ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        Join
                      </Button>
                    ))}

                  {/* Creator actions */}
                  {isCreator && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditOpen(true)}
                        className="h-8 px-3.5 rounded-xl font-bold gap-1.5 border-border/50 text-xs hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deleting}
                            className="h-8 px-3.5 rounded-xl font-bold gap-1.5 text-xs border-destructive/20 text-destructive/70 hover:bg-destructive/8 hover:border-destructive/40 hover:text-destructive"
                          >
                            {deleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-black">
                              Delete c/{community.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the community and all
                              its posts. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Delete Community
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════
                BODY: SIDEBAR + MAIN
            ══════════════════════════════════════ */}
            <div className="flex flex-col md:flex-row gap-5 pt-1">
              {/* ── Sidebar ── */}
              <aside className="md:w-60 shrink-0 space-y-3">
                {/* About */}
                <Card className="border-border/40 shadow-none bg-card/80">
                  <CardContent className="p-4 space-y-3.5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                      <Info className="w-3 h-3" />
                      About
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {community.description || "Welcome to this community!"}
                    </p>

                    <Separator className="opacity-40" />

                    <div className="space-y-2.5">
                      <StatChip
                        icon={Users}
                        value={memberCount}
                        label="members"
                      />
                      <StatChip
                        icon={LayoutGrid}
                        value={postCount}
                        label="posts"
                      />
                      <StatChip
                        icon={Calendar}
                        value={null}
                        label={`Est. ${new Date(community.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Moderator */}
                <Card className="border-border/40 shadow-none bg-card/80">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Moderator
                    </h3>
                    {community.createdBy ? (
                      <Link
                        to={`/profile/${community.createdBy.username}`}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar className="w-8 h-8 rounded-xl border border-border/30 shrink-0">
                          <AvatarImage
                            src={getAvatarUrl(community.createdBy)}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600">
                            {community.createdBy.username
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-bold group-hover:text-primary transition-colors">
                            u/{community.createdBy.username}
                          </p>
                          <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5" />
                            Founder
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Anonymous
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Join CTA for non-members */}
                {!isMember && !isCreator && userInfo && (
                  <Card className="border-primary/20 bg-primary/5 shadow-none">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-xs text-foreground/70 leading-relaxed">
                        Join this community to post and participate in
                        discussions.
                      </p>
                      <Button
                        size="sm"
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full h-8 rounded-xl text-xs font-bold gap-1.5 shadow-sm"
                      >
                        {joining ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Users className="w-3.5 h-3.5" />
                        )}
                        Join Community
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </aside>

              {/* ── Main Content ── */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-border/40 px-0.5 overflow-x-auto scrollbar-hide">
                  {TABS.map(({ id, Icon, label, count }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-bold border-b-2 pb-2.5 pt-1 px-3 transition-all duration-150 whitespace-nowrap",
                        activeTab === id
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground/60 hover:text-foreground hover:border-border/60",
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {label}
                      <span
                        className={cn(
                          "text-[10px] font-black tabular-nums px-1.5 py-0.5 rounded-md",
                          activeTab === id
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {fmt(count)}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Feed Tab ── */}
                  {activeTab === "posts" && (
                    <motion.div
                      key="posts"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      {posts.length > 0 ? (
                        <>
                          {/* Non-member join nudge */}
                          {!isMember && !isCreator && userInfo && (
                            <Card className="border-primary/20 bg-primary/5 shadow-none">
                              <CardContent className="p-3 flex items-center justify-between gap-3">
                                <p className="text-xs text-foreground/70 font-medium">
                                  Join to participate in discussions.
                                </p>
                                <Button
                                  size="sm"
                                  onClick={handleJoin}
                                  disabled={joining}
                                  className="h-7 px-3 rounded-lg text-xs font-bold shrink-0 gap-1"
                                >
                                  {joining ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Users className="w-3 h-3" />
                                  )}
                                  Join
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                          {posts.map((post, i) => (
                            <motion.div
                              key={post._id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.15,
                                delay: Math.min(i * 0.03, 0.2),
                              }}
                            >
                              <PostCard post={post} />
                            </motion.div>
                          ))}
                        </>
                      ) : (
                        <EmptyPosts
                          isMember={isMember || isCreator}
                          community={community}
                          handleJoin={handleJoin}
                          joining={joining}
                        />
                      )}
                    </motion.div>
                  )}

                  {/* ── Members Tab ── */}
                  {activeTab === "members" && (
                    <motion.div
                      key="members"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {community.members?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {community.members.map((member) => {
                            const memberId = (member._id || member)?.toString();
                            const founderId = (
                              community.createdBy?._id || community.createdBy
                            )?.toString();
                            return (
                              <MemberCard
                                key={memberId}
                                member={member}
                                isFounder={memberId === founderId}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
                          <Users className="w-7 h-7 text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-bold mb-1">
                            No members yet
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Be the first to join!
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <EditCommunityModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          community={community}
        />
      </div>
    </TooltipProvider>
  );
};

export default CommunityProfile;
