import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  useGetPostByIdQuery,
  useToggleVoteMutation,
} from "../app/api/postsApi";
import PostCard from "../components/PostCard";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toast } from "sonner";
import {
  cn,
  getAvatarUrl,
  getCommunityIconUrl,
  getCommunityBannerUrl,
} from "@/lib/utils";

import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  Globe,
  PlusCircle,
  UserPlus,
  Check,
  Link2,
  Flag,
  ChevronDown,
  Award,
  Zap,
  MessageSquareX,
  MoreHorizontal,
  Eye,
  TrendingUp,
  Shield,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const timeAgo = (date) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const readTime = (text = "") => {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const fmt = (n = 0) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);

/* ─────────────────────────────────────────
   StatItem
───────────────────────────────────────── */
const StatItem = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col gap-1 group">
    <div className="flex items-center gap-1.5">
      {Icon && (
        <Icon className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
      )}
      <span className="text-sm font-black tracking-tight text-foreground">
        {value}
      </span>
    </div>
    <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-[0.18em]">
      {label}
    </span>
  </div>
);

/* ─────────────────────────────────────────
   Divider
───────────────────────────────────────── */
const Dot = () => (
  <span className="text-muted-foreground/20 select-none font-thin">·</span>
);

/* ─────────────────────────────────────────
   VoteBar  (left-rail vertical)
───────────────────────────────────────── */
const VoteRail = ({ hasUp, hasDown, score, onUp, onDown }) => (
  <div className="hidden lg:flex flex-col items-center gap-1 py-1">
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onUp}
      className={cn(
        "group flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200",
        hasUp
          ? "bg-amber-500/15 text-amber-500"
          : "text-muted-foreground/50 hover:bg-muted hover:text-amber-500",
      )}
    >
      <ArrowBigUp
        className="h-5 w-5 transition-transform group-hover:scale-110"
        fill={hasUp ? "currentColor" : "none"}
      />
    </motion.button>

    <motion.span
      key={score}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "text-xs font-black min-w-[28px] text-center tabular-nums",
        hasUp
          ? "text-amber-500"
          : hasDown
            ? "text-violet-500"
            : "text-foreground",
      )}
    >
      {fmt(score)}
    </motion.span>

    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onDown}
      className={cn(
        "group flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-200",
        hasDown
          ? "bg-violet-500/15 text-violet-500"
          : "text-muted-foreground/50 hover:bg-muted hover:text-violet-500",
      )}
    >
      <ArrowBigDown
        className="h-5 w-5 transition-transform group-hover:scale-110"
        fill={hasDown ? "currentColor" : "none"}
      />
    </motion.button>
  </div>
);

/* ─────────────────────────────────────────
   CommunityWidget
───────────────────────────────────────── */
const CommunityWidget = ({ community }) => {
  const [joined, setJoined] = useState(false);

  return (
    <Card className="overflow-hidden border-border/30 bg-card/60 backdrop-blur-xl shadow-md shadow-black/5 rounded-2xl">
      {/* Banner */}
      <div className="h-[72px] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-rose-500/20"
          aria-hidden
        />
        {getCommunityBannerUrl(community) && (
          <img
            src={getCommunityBannerUrl(community)}
            alt=""
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
      </div>

      <CardContent className="px-4 pb-4 pt-0">
        <div className="flex items-end gap-3 -mt-7 mb-3.5">
          <div className="relative">
            <Avatar className="w-14 h-14 border-[3px] border-card rounded-2xl shadow-lg ring-1 ring-border/20">
              <AvatarImage src={getCommunityIconUrl(community)} />
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-lg">
                {community?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card" />
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <Link
              to={`/communities/${community?.name}`}
              className="text-sm font-black text-foreground hover:text-primary transition-colors block truncate leading-tight"
            >
              c/{community?.name}
            </Link>
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.18em] mt-0.5">
              {community?.category || "Community"}
            </p>
          </div>
        </div>

        {community?.description && (
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {community.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-0 py-3.5 border-y border-border/10 mb-4">
          <StatItem
            label="Members"
            icon={Globe}
            value={fmt(
              community?.memberCount || community?.members?.length || 0,
            )}
          />
          <StatItem
            label="Posts"
            icon={TrendingUp}
            value={fmt(community?.postCount || 0)}
          />
        </div>

        <Button
          variant={joined ? "outline" : "default"}
          size="sm"
          className={cn(
            "w-full h-9 font-bold rounded-xl transition-all active:scale-[0.97] text-[13px]",
            !joined &&
              "bg-foreground hover:bg-foreground/90 text-background shadow-none",
          )}
          onClick={() => {
            setJoined(!joined);
            toast.success(joined ? "Left community" : "Joined!", {
              description: joined
                ? `You've left c/${community?.name}`
                : `Welcome to c/${community?.name}!`,
            });
          }}
        >
          <motion.span
            key={joined ? "joined" : "join"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            {joined ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <PlusCircle className="h-3.5 w-3.5" />
            )}
            {joined ? "Joined" : "Join Community"}
          </motion.span>
        </Button>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   AuthorWidget
───────────────────────────────────────── */
const AuthorWidget = ({ author, navigate }) => {
  const [following, setFollowing] = useState(false);

  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-xl shadow-md shadow-black/5 rounded-2xl">
      <CardContent className="p-4">
        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.18em] mb-3.5">
          Posted by
        </p>

        <div className="flex items-center gap-3 mb-3.5">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="cursor-pointer"
            onClick={() => navigate(`/profile/${author?.username}`)}
          >
            <Avatar className="w-11 h-11 rounded-xl border border-border/20 shadow-sm">
              <AvatarImage src={getAvatarUrl(author)} />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 text-white font-bold text-base">
                {author?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${author?.username}`}
              className="text-sm font-black text-foreground hover:text-primary transition-colors block truncate"
            >
              u/{author?.username}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
                {author?.followers?.length || 0} followers
              </span>
            </div>
          </div>

          <Button
            variant={following ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "h-8 rounded-xl text-xs font-bold px-3 transition-all active:scale-95 shrink-0",
              following && "bg-primary/10 text-primary border-primary/20",
            )}
            onClick={() => {
              setFollowing(!following);
              toast.success(
                following ? "Unfollowed" : `Following u/${author?.username}`,
              );
            }}
          >
            {following ? (
              <Check className="h-3 w-3 mr-1.5" />
            ) : (
              <UserPlus className="h-3 w-3 mr-1.5" />
            )}
            {following ? "Following" : "Follow"}
          </Button>
        </div>

        {author?.bio && (
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-3.5 pl-0.5">
            {author.bio}
          </p>
        )}

        <div className="flex items-center gap-3 pt-3.5 border-t border-border/10 text-[11px] text-muted-foreground/50">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Joined{" "}
            {author?.createdAt
              ? new Date(author.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })
              : "2024"}
          </span>
          <Dot />
          <span className="flex items-center gap-1.5">
            <Award className="h-3 w-3" />
            {author?.postCount || 0} posts
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────
   RulesWidget
───────────────────────────────────────── */
const RulesWidget = () => (
  <Card className="border-border/30 bg-card/60 backdrop-blur-xl shadow-md shadow-black/5 rounded-2xl overflow-hidden">
    <CardHeader className="px-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
        <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Community Rules
        </CardTitle>
      </div>
    </CardHeader>
    <CardContent className="px-4 pt-1 pb-4 space-y-2.5">
      {[
        "Respect community guidelines",
        "Keep discussion relevant",
        "No self-promotion or spam",
        "Be helpful and constructive",
      ].map((rule, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, ease: "easeOut" }}
          className="flex gap-3 text-[13px] text-muted-foreground leading-snug group"
        >
          <span className="font-black text-muted-foreground/20 tabular-nums shrink-0 group-hover:text-primary/50 transition-colors text-xs mt-px">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="group-hover:text-foreground/70 transition-colors">
            {rule}
          </p>
        </motion.div>
      ))}
    </CardContent>
  </Card>
);

/* ─────────────────────────────────────────
   ShareWidget
───────────────────────────────────────── */
const ShareWidget = ({ onCopy }) => (
  <Card className="border-border/20 border-dashed bg-gradient-to-br from-primary/[0.04] via-transparent to-amber-500/[0.03] rounded-2xl p-5 relative overflow-hidden group">
    <div
      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(ellipse at 80% 100%, rgba(245,158,11,0.06) 0%, transparent 60%)",
      }}
      aria-hidden
    />
    <Sparkles className="absolute -right-3 -bottom-3 w-20 h-20 text-primary/[0.04] group-hover:text-primary/[0.09] transition-colors duration-500" />
    <div className="relative z-10">
      <p className="text-sm font-black text-foreground mb-1 tracking-tight">
        Loved this post?
      </p>
      <p className="text-[13px] text-muted-foreground/70 mb-4 leading-relaxed">
        Share it with your community and spark more conversations.
      </p>
      <Button
        size="sm"
        className="w-full h-9 rounded-xl font-bold text-[13px] bg-foreground text-background hover:opacity-90 transition-all active:scale-[0.97]"
        onClick={onCopy}
      >
        <Link2 className="mr-2 h-3.5 w-3.5" />
        Copy Link
      </Button>
    </div>
  </Card>
);

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
const PageSkeleton = () => (
  <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_304px] gap-10">
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-3 w-48 rounded-full" />
      </div>
      <Skeleton className="h-10 w-4/5 rounded-xl" />
      <Skeleton className="h-5 w-2/5 rounded-full" />
      <Skeleton className="h-[220px] w-full rounded-2xl" />
      <div className="space-y-3 pt-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-[220px] w-full rounded-2xl" />
      <Skeleton className="h-[160px] w-full rounded-2xl" />
      <Skeleton className="h-[140px] w-full rounded-2xl" />
    </div>
  </div>
);

/* ─────────────────────────────────────────
   PostPage
───────────────────────────────────────── */
const PostPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);

  const { data: post, isLoading, isError } = useGetPostByIdQuery(idOrSlug);
  const [toggleVote] = useToggleVoteMutation();

  const [localUp, setLocalUp] = useState([]);
  const [localDown, setLocalDown] = useState([]);
  const [saved, setSaved] = useState(false);
  const [sort, setSort] = useState("Best");

  const headerRef = useRef(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (post) {
      setLocalUp(post.upvotes || []);
      setLocalDown(post.downvotes || []);
    }
  }, [post]);

  const uid = userInfo?._id;
  const hasUp = localUp.includes(uid);
  const hasDown = localDown.includes(uid);
  const score = localUp.length - localDown.length;

  const copyUrl = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/post/${post?._id}`
        : "";
    navigator.clipboard.writeText(url);
    toast.success("Link copied!", {
      description: "Share it anywhere you like.",
      icon: <Link2 className="h-4 w-4" />,
    });
  };

  const vote = async (type) => {
    if (!userInfo) {
      toast.error("Sign in to vote", {
        description: "Create a free account in seconds.",
      });
      return;
    }
    const prevU = [...localUp];
    const prevD = [...localDown];

    if (type === "upvote") {
      hasUp
        ? setLocalUp((p) => p.filter((id) => id !== uid))
        : (setLocalUp((p) => [...p, uid]),
          setLocalDown((p) => p.filter((id) => id !== uid)));
    } else {
      hasDown
        ? setLocalDown((p) => p.filter((id) => id !== uid))
        : (setLocalDown((p) => [...p, uid]),
          setLocalUp((p) => p.filter((id) => id !== uid)));
    }

    try {
      await toggleVote({ id: post._id, type }).unwrap();
    } catch {
      setLocalUp(prevU);
      setLocalDown(prevD);
      toast.error("Vote failed", { description: "Please try again." });
    }
  };

  /* ── Loading ── */
  if (isLoading) return <PageSkeleton />;

  /* ── Error ── */
  if (isError || !post)
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[72vh] px-6 text-center"
      >
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-muted/60 border border-border/30 flex items-center justify-center shadow-sm backdrop-blur-sm">
            <MessageSquareX className="w-9 h-9 text-muted-foreground/25" />
          </div>
        </div>
        <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
          Post not found
        </h2>
        <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed mb-8">
          This post may have been deleted, or the URL is incorrect.
        </p>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          size="sm"
          className="rounded-xl h-9 font-bold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discover
        </Button>
      </motion.div>
    );

  /* ── Render ── */
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full min-h-screen bg-background selection:bg-primary/10">
        {/* ── Sticky Header ── */}
        <header
          ref={headerRef}
          className="sticky top-0 z-50 border-b border-border/30 bg-background/75 backdrop-blur-2xl"
        >
          <div className="max-w-[1320px] mx-auto px-4 md:px-6 h-[52px] flex items-center gap-3">
            {/* Back */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 rounded-xl shrink-0 hover:bg-muted/60 active:scale-95 transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Go back
              </TooltipContent>
            </Tooltip>

            <Separator
              orientation="vertical"
              className="h-4 opacity-30 hidden sm:block"
            />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 min-w-0 flex-1 text-[13px]">
              <Avatar className="h-5 w-5 rounded-md shrink-0">
                <AvatarImage src={getCommunityIconUrl(post.community)} />
                <AvatarFallback className="text-[8px] font-black rounded-md bg-muted">
                  {post.community?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <Link
                to={`/communities/${post.community?.name}`}
                className="font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 hidden sm:block"
              >
                c/{post.community?.name}
              </Link>
              <ChevronDown className="h-3 w-3 text-muted-foreground/30 shrink-0 hidden sm:block -rotate-90" />
              <span className="font-medium text-foreground/70 truncate leading-tight">
                {post.title}
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant="secondary"
                className="hidden lg:flex gap-1.5 bg-muted/50 border-0 text-[10px] font-bold py-1 px-2.5 rounded-lg text-muted-foreground"
              >
                <Clock className="h-3 w-3" />
                {readTime(post.content)}
              </Badge>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSaved(!saved);
                      toast.success(saved ? "Removed from saved" : "Saved!", {
                        description: saved
                          ? ""
                          : "Find it anytime in your profile.",
                      });
                    }}
                    className={cn(
                      "h-8 w-8 rounded-xl hidden sm:flex items-center justify-center transition-all active:scale-95",
                      saved
                        ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/15"
                        : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    <Bookmark
                      className="h-4 w-4"
                      fill={saved ? "currentColor" : "none"}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {saved ? "Remove from saved" : "Save post"}
                </TooltipContent>
              </Tooltip>

              <Button
                size="sm"
                variant="outline"
                onClick={copyUrl}
                className="h-8 rounded-xl font-bold hidden sm:flex items-center gap-1.5 px-3 text-[13px] border-border/40 hover:bg-muted/60 active:scale-95 transition-all"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="sm:hidden h-8 w-8 rounded-xl"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main Layout ── */}
        <main className="max-w-[1320px] mx-auto px-4 md:px-6 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-[1fr_304px] gap-8 lg:gap-10 items-start">
          {/* ══ Left: Post Content ══ */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 flex gap-4"
          >
            {/* Vote Rail (desktop) */}
            <VoteRail
              hasUp={hasUp}
              hasDown={hasDown}
              score={score}
              onUp={() => vote("upvote")}
              onDown={() => vote("downvote")}
            />

            {/* Article Body */}
            <div className="flex-1 min-w-0">
              {/* Meta Row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-2 mb-5 text-[13px]"
              >
                <Avatar className="h-7 w-7 rounded-full border border-border/20 shrink-0">
                  <AvatarImage src={getAvatarUrl(post.author)} />
                  <AvatarFallback className="text-[10px] font-black bg-gradient-to-br from-violet-400 to-indigo-500 text-white">
                    {post.author?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link
                  to={`/profile/${post.author?.username}`}
                  className="font-bold text-foreground hover:text-primary transition-colors"
                >
                  u/{post.author?.username}
                </Link>
                <Dot />
                <Link
                  to={`/communities/${post.community?.name}`}
                  className="font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  c/{post.community?.name}
                </Link>
                <Dot />
                <span className="text-muted-foreground/50">
                  {timeAgo(post.createdAt)}
                </span>

                {post.community?.category && (
                  <Badge
                    variant="secondary"
                    className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary/70 border-0"
                  >
                    {post.community.category}
                  </Badge>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="text-[1.65rem] md:text-[2.2rem] font-black leading-[1.12] tracking-tight text-foreground mb-5"
                style={{ fontFeatureSettings: '"kern" 1' }}
              >
                {post.title}
              </motion.h1>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 }}
                className="relative mb-7"
              >
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
                <p className="text-[15px] md:text-[15.5px] text-foreground/75 leading-[1.78] whitespace-pre-wrap pl-5">
                  {post.content}
                </p>
              </motion.div>

              {/* ── Action Bar ── */}
              <div className="flex items-center gap-1.5 py-3 border-y border-border/25 mb-8">
                {/* Mobile vote */}
                <div className="flex lg:hidden items-center bg-muted/40 rounded-xl p-0.5 border border-border/15 mr-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => vote("upvote")}
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                      hasUp
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-muted-foreground hover:text-amber-500",
                    )}
                  >
                    <ArrowBigUp
                      className="h-4 w-4"
                      fill={hasUp ? "currentColor" : "none"}
                    />
                  </motion.button>
                  <motion.span
                    key={score}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "text-xs font-black px-2 min-w-[26px] text-center tabular-nums",
                      hasUp
                        ? "text-amber-500"
                        : hasDown
                          ? "text-violet-500"
                          : "text-foreground",
                    )}
                  >
                    {fmt(score)}
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => vote("downvote")}
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                      hasDown
                        ? "text-violet-500 bg-violet-500/10"
                        : "text-muted-foreground hover:text-violet-500",
                    )}
                  >
                    <ArrowBigDown
                      className="h-4 w-4"
                      fill={hasDown ? "currentColor" : "none"}
                    />
                  </motion.button>
                </div>

                {/* Comments count */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-xl text-[13px] text-muted-foreground font-bold hover:text-foreground hover:bg-muted/60 gap-1.5 px-3"
                >
                  <MessageSquare className="h-4 w-4" />
                  {fmt(post.commentCount || 0)}
                  <span className="hidden sm:inline text-muted-foreground/50 font-medium">
                    comments
                  </span>
                </Button>

                {/* Save (mobile) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSaved(!saved);
                    toast.success(saved ? "Removed from saved" : "Saved!");
                  }}
                  className={cn(
                    "h-8 rounded-xl text-[13px] font-bold gap-1.5 px-3 sm:hidden transition-all active:scale-95",
                    saved ? "text-amber-500" : "text-muted-foreground",
                  )}
                >
                  <Bookmark
                    className="h-4 w-4"
                    fill={saved ? "currentColor" : "none"}
                  />
                </Button>

                {/* Share (mobile) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyUrl}
                  className="h-8 rounded-xl text-[13px] text-muted-foreground font-bold gap-1.5 px-3 sm:hidden hover:bg-muted/60"
                >
                  <Link2 className="h-4 w-4" />
                </Button>

                {/* Flag */}
                <div className="ml-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground/30 hover:text-destructive hover:bg-destructive/8 transition-all"
                      >
                        <Flag className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Report post
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* ── Comments Section ── */}
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black tracking-tight flex items-center gap-2.5">
                    Discussion
                    <span className="inline-flex items-center justify-center bg-muted text-muted-foreground text-[10px] font-black rounded-full px-2 py-0.5 min-w-[1.5rem]">
                      {fmt(post.commentCount || 0)}
                    </span>
                  </h3>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 px-3"
                      >
                        Sort: {sort}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border-border/30 bg-card/90 backdrop-blur-xl shadow-lg shadow-black/10"
                    >
                      {["Best", "New", "Top", "Controversial"].map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() => setSort(s)}
                          className={cn(
                            "text-[13px] font-medium cursor-pointer rounded-lg mx-1 my-0.5",
                            s === sort && "font-bold text-primary bg-primary/5",
                          )}
                        >
                          {s === sort && (
                            <Check className="h-3 w-3 mr-2 opacity-60" />
                          )}
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <PostCard
                  post={post}
                  initialShowComments={true}
                  customLayout={true}
                />
              </section>
            </div>
          </motion.article>

          {/* ══ Right: Sidebar ══ */}
          <motion.aside
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-4 sticky top-[68px] self-start pb-10"
          >
            <CommunityWidget community={post.community} />
            <AuthorWidget author={post.author} navigate={navigate} />
            <RulesWidget />
            <ShareWidget onCopy={copyUrl} />
          </motion.aside>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default PostPage;
