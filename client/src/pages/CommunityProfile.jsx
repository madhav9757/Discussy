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
import EditCommunityModal from "../components/modals/EditCommunityModal";
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
import { getAvatarUrl, getCommunityIconUrl, getCommunityBannerUrl, cn } from "@/lib/utils";

const CommunityProfile = () => {
  const { idOrName } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: community,
    isLoading,
    isError,
  } = useGetCommunityByIdQuery(idOrName, { skip: !idOrName });

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
      await joinCommunity(community._id).unwrap();
      toast.success(`Joined c/${community.name}!`);
    } catch (err) {
      toast.error(err.data?.message || "Failed to join");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity(community._id).unwrap();
      toast.success(`Left c/${community.name}`);
    } catch (err) {
      toast.error(err.data?.message || "Failed to leave");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete c/${community.name}? This will also delete all posts.`)) return;
    try {
      await deleteCommunity(community._id).unwrap();
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
    <div className="h-full w-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 py-8 pb-20">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* ── Banner ─────────────────────────────────────────── */}
          <div 
            className={`relative rounded-2xl overflow-hidden border border-border/30 ${!getCommunityBannerUrl(community) && `bg-linear-to-br ${colorClass}`} h-[25vh] md:h-[30vh] shadow-sm`}
            style={getCommunityBannerUrl(community) ? {
              backgroundImage: `url("${getCommunityBannerUrl(community)}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.03),transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-background/40 to-transparent" />
          </div>

          {/* ── Community Header ────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center -mt-10 px-1 relative z-10">
            {/* Avatar */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-background bg-muted overflow-hidden shadow-md shrink-0 flex items-center justify-center transition-transform hover:scale-[1.02]">
              <img
                src={getCommunityIconUrl(community)}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 pt-8 md:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground/90">c/{community.name}</h1>
                    {isCreator && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/5 px-1.5 py-0.5 rounded border border-orange-500/20">
                        <Crown size={9} /> Founder
                      </span>
                    )}
                    {isMember && !isCreator && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/20">
                        <UserCheck size={9} /> Member
                      </span>
                    )}
                  </div>
                  {community.category && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground/60 mt-0.5 uppercase tracking-tighter">
                      <Tag size={10} /> {community.category}
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
                        className="h-8 px-3.5 rounded-lg font-bold gap-2 border-border/40 text-xs"
                      >
                        <PenSquare size={13} /> New Post
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
                        className="h-8 px-4 rounded-lg font-bold gap-2 text-xs hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5"
                      >
                        {leaving ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
                        Leave
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleJoin}
                        disabled={joining}
                        className="h-8 px-4 rounded-lg font-bold gap-2 text-xs"
                      >
                        {joining ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
                        Join
                      </Button>
                    )
                  )}

                  {/* Mod actions */}
                  {isCreator && (
                    <div className="flex items-center gap-2">
                       <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditOpen(true)}
                        className="h-8 px-3.5 rounded-lg font-bold gap-2 border-border/40 text-xs"
                      >
                        <Settings size={13} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="h-8 px-3 rounded-lg font-bold gap-2 text-xs opacity-80 hover:opacity-100"
                      >
                        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── About + Stats + Content ─────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-5">
            {/* Sidebar */}
            <aside className="md:w-64 shrink-0 space-y-4">
              {/* About Card */}
              <div className="border border-border/40 bg-card rounded-xl p-4 space-y-3 shadow-xs">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Information
                </h3>
                <p className="text-[13px] text-muted-foreground font-medium leading-relaxed italic">
                  {community.description || "Welcome to the group."}
                </p>
                <div className="pt-2 border-t border-border/30 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-[12px] font-medium">
                    <Users className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
                    <span className="text-foreground/80">
                      <strong className="font-bold">{memberCount.toLocaleString()}</strong>
                      <span className="text-muted-foreground ml-1">Members</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px] font-medium">
                    <Grid className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
                    <span className="text-foreground/80">
                      <strong className="font-bold">{postCount.toLocaleString()}</strong>
                      <span className="text-muted-foreground ml-1">Discussions</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
                    <span className="text-muted-foreground/80">
                      EST{" "}
                      {new Date(community.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moderator card */}
              <div className="border border-border/40 bg-card rounded-xl p-4 space-y-3 shadow-xs">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Moderator
                </h3>
                {community.createdBy ? (
                  <Link
                    to={`/profile/${community.createdBy.username}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted border border-border/30 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                      <img
                        src={getAvatarUrl(community.createdBy)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold group-hover:text-primary transition-colors">
                        u/{community.createdBy.username}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">Anonymous</p>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Tab bar */}
              <div className="flex items-center gap-4 border-b border-border/30 px-1 overflow-x-auto no-scrollbar">
                {[
                  { id: "posts", icon: <Grid size={13} strokeWidth={2.5} />, label: "Feed" },
                  { id: "members", icon: <Users size={13} strokeWidth={2.5} />, label: `People` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 text-[13px] font-bold border-b-2 py-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground/60 hover:text-foreground"
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
                        <div className="border border-primary/20 bg-primary/5 rounded-xl p-3 flex items-center justify-between gap-3">
                          <p className="text-[12px] font-medium text-foreground/70">
                            Join this community to participate in the conversation.
                          </p>
                          <Button size="sm" onClick={handleJoin} disabled={joining} className="h-7 px-3 rounded-lg text-xs font-bold">
                            {joining ? <Loader2 size={10} className="animate-spin" /> : "Join Now"}
                          </Button>
                        </div>
                      )}
                      {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </>
                  ) : (
                    <div className="border border-border/40 bg-card rounded-xl min-h-[220px] flex items-center justify-center shadow-xs">
                      <div className="text-center p-6 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                          <Grid className="w-5 h-5 text-muted-foreground/20" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground/70 text-base">Quiet in here...</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Be the first to start a discussion.
                          </p>
                        </div>
                        {isMember && (
                          <CreatePostModal defaultCommunity={community._id}>
                            <Button size="sm" className="rounded-lg px-5 h-8 text-xs font-bold gap-2">
                              <PenSquare size={13} /> Create First Post
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {community.members?.length > 0 ? (
                    community.members.map((member) => (
                      <Link
                        key={member._id || member}
                        to={`/profile/${member.username}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-card hover:border-primary/20 hover:bg-muted/10 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted border border-border/30 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                          <img
                            src={getAvatarUrl(member)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] truncate group-hover:text-primary transition-colors">
                            u/{member.username}
                          </p>
                          {(member._id || member).toString() === (community.createdBy?._id || community.createdBy)?.toString() && (
                            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Founder</p>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-muted-foreground py-8 italic text-xs">
                      No members yet.
                    </div>
                  )}
                </div>
              )}
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
  );
};

export default CommunityProfile;
