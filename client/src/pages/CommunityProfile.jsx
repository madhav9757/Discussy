import { useState } from "react";
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
import {
  Hash,
  Users,
  Calendar,
  Grid,
  Loader2,
  Settings,
  LogOut,
  Trash2,
  Tag,
  PenSquare,
  Crown,
  UserCheck,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const CommunityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("posts");

  const {
    data: community,
    isLoading,
    isError,
  } = useGetCommunityByIdQuery(id, { skip: !id });

  const [joinCommunity, { isLoading: joining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: leaving }] = useLeaveCommunityMutation();
  const [deleteCommunity, { isLoading: deleting }] = useDeleteCommunityMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (isError || !community) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-3xl">
          <p className="text-destructive font-semibold">Community Not Found</p>
          <p className="text-sm text-muted-foreground mt-1">
            This community doesn't exist or has been removed.
          </p>
        </div>
        <Button onClick={() => navigate("/communities")} variant="outline" className="rounded-full">
          Browse Communities
        </Button>
      </div>
    );
  }

  const isMember = community.members?.some(
    (m) => (m._id || m) === userInfo?._id || (m._id || m).toString() === userInfo?._id
  );
  const isCreator =
    (community.createdBy?._id || community.createdBy) === userInfo?._id ||
    (community.createdBy?._id || community.createdBy)?.toString() === userInfo?._id;

  const handleJoin = async () => {
    if (!userInfo) { toast.error("Please login to join communities"); navigate("/login"); return; }
    try {
      await joinCommunity(id).unwrap();
      toast.success(`Joined c/${community.name}!`);
    } catch (err) {
      toast.error(err.data?.message || "Failed to join");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity(id).unwrap();
      toast.success(`Left c/${community.name}`);
    } catch (err) {
      toast.error(err.data?.message || "Failed to leave");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete c/${community.name}? This will also delete all posts.`)) return;
    try {
      await deleteCommunity(id).unwrap();
      toast.success("Community deleted");
      navigate("/communities");
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete");
    }
  };

  const posts = community.posts || [];
  const memberCount = community.members?.length || 0;
  const postCount = posts.length;

  // Seed for visual identity
  const seed = community.name;
  const bannerColors = [
    "from-violet-500/20 via-primary/10 to-indigo-500/20",
    "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
    "from-pink-500/20 via-rose-500/10 to-red-500/20",
  ];
  const colorClass = bannerColors[community.name.charCodeAt(0) % bannerColors.length];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Banner ─────────────────────────────────────────── */}
      <div className={`relative rounded-3xl overflow-hidden border border-border/60 bg-linear-to-br ${colorClass} h-36 md:h-48`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-card/80 to-transparent" />
      </div>

      {/* ── Community Header ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-5 items-start md:items-center -mt-12 px-2 relative z-10">
        {/* Avatar */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-4 border-card bg-muted overflow-hidden shadow-lg shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=transparent`}
            alt={community.name}
            className="w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0 pt-10 md:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">c/{community.name}</h1>
                {isCreator && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Crown size={10} /> Mod
                  </span>
                )}
                {isMember && !isCreator && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    <UserCheck size={10} /> Member
                  </span>
                )}
              </div>
              {community.category && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground/70 mt-0.5">
                  <Tag size={11} /> {community.category}
                </span>
              )}
            </div>

            <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
              {/* Create post in community */}
              {isMember && (
                <CreatePostModal defaultCommunity={community._id}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 px-4 rounded-full font-semibold gap-2 border-border/60"
                  >
                    <PenSquare size={14} /> Post
                  </Button>
                </CreatePostModal>
              )}

              {/* Join / Leave */}
              {userInfo && !isCreator && (
                isMember ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleLeave}
                    disabled={leaving}
                    className="h-9 px-5 rounded-full font-semibold gap-2 hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5"
                  >
                    {leaving ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                    Leave
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleJoin}
                    disabled={joining}
                    className="h-9 px-5 rounded-full font-semibold gap-2"
                  >
                    {joining ? <Loader2 size={13} className="animate-spin" /> : <Users size={13} />}
                    Join Community
                  </Button>
                )
              )}

              {/* Mod actions */}
              {isCreator && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-9 px-4 rounded-full font-semibold gap-2 opacity-80 hover:opacity-100"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── About + Stats + Content ─────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-72 shrink-0 space-y-4">
          {/* About Card */}
          <div className="border border-border/60 bg-card rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              About
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {community.description || "No description yet."}
            </p>
            <div className="pt-2 border-t border-border/40 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-primary/70 shrink-0" />
                <span>
                  <strong className="font-black text-foreground">{memberCount.toLocaleString()}</strong>
                  <span className="text-muted-foreground ml-1">{memberCount === 1 ? "member" : "members"}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Grid className="w-4 h-4 text-primary/70 shrink-0" />
                <span>
                  <strong className="font-black text-foreground">{postCount.toLocaleString()}</strong>
                  <span className="text-muted-foreground ml-1">{postCount === 1 ? "post" : "posts"}</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary/70 shrink-0" />
                <span className="text-muted-foreground">
                  Created{" "}
                  {new Date(community.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Moderator card */}
          <div className="border border-border/60 bg-card rounded-3xl p-5 space-y-3 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
              Moderator
            </h3>
            {community.createdBy ? (
              <Link
                to={`/profile/${community.createdBy._id || community.createdBy}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-full bg-muted border border-border/40 overflow-hidden group-hover:scale-105 transition-transform">
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${community.createdBy.username}`}
                    alt={community.createdBy.username}
                    className="w-full h-full p-0.5"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold group-hover:text-primary transition-colors">
                    u/{community.createdBy.username}
                  </p>
                  <p className="text-[11px] text-amber-500 font-semibold">Community Founder</p>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Unknown</p>
            )}
          </div>

          {/* Top Members */}
          {community.members?.length > 0 && (
            <div className="border border-border/60 bg-card rounded-3xl p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                Members
              </h3>
              <div className="flex flex-wrap gap-2">
                {community.members.slice(0, 8).map((member) => (
                  <Link
                    key={member._id || member}
                    to={`/profile/${member._id || member}`}
                    title={`u/${member.username}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted border border-border/40 overflow-hidden hover:scale-110 hover:border-primary/40 transition-all">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.username || member}`}
                        alt={member.username}
                        className="w-full h-full p-0.5"
                      />
                    </div>
                  </Link>
                ))}
                {community.members.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-muted/60 border border-border/40 flex items-center justify-center text-[10px] font-black text-muted-foreground">
                    +{community.members.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-border/60 overflow-x-auto no-scrollbar">
            {[
              { id: "posts", icon: <Grid size={14} />, label: "Posts" },
              { id: "members", icon: <Users size={14} />, label: `Members (${memberCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm font-semibold border-b-2 pb-3 px-3 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Posts tab */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length > 0 ? (
                <>
                  {!isMember && userInfo && (
                    <div className="border border-primary/20 bg-primary/5 rounded-2xl p-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground/80">
                        <span className="text-primary">Join</span> this community to start posting and commenting.
                      </p>
                      <Button size="sm" onClick={handleJoin} disabled={joining} className="h-8 px-4 rounded-full shrink-0">
                        {joining ? <Loader2 size={12} className="animate-spin" /> : "Join"}
                      </Button>
                    </div>
                  )}
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </>
              ) : (
                <div className="border border-border/60 bg-card rounded-3xl min-h-[280px] flex items-center justify-center shadow-sm">
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                      <Grid className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-black text-foreground/70 text-lg">No posts yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Be the first to post in c/{community.name}!
                      </p>
                    </div>
                    {isMember && (
                      <CreatePostModal defaultCommunity={community._id}>
                        <Button size="sm" className="rounded-full px-6 gap-2">
                          <PenSquare size={14} /> Create Post
                        </Button>
                      </CreatePostModal>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members tab */}
          {activeTab === "members" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {community.members?.length > 0 ? (
                community.members.map((member) => (
                  <Link
                    key={member._id || member}
                    to={`/profile/${member._id || member}`}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted border border-border/40 overflow-hidden group-hover:scale-105 transition-transform">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${member.username || member}`}
                        alt={member.username}
                        className="w-full h-full p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                        u/{member.username}
                      </p>
                      {(member._id || member).toString() === (community.createdBy?._id || community.createdBy)?.toString() && (
                        <p className="text-[11px] text-amber-500 font-semibold">Moderator</p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-12 italic text-sm">
                  No members yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityProfile;
