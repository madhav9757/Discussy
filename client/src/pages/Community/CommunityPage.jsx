import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  Users,
  Calendar,
  User as UserIcon,
  Plus,
  Trash2,
  LogOut,
  UserPlus,
  MoreVertical,
  ArrowLeft,
  MessageSquare,
  Settings,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useDeleteCommunityMutation,
} from "@/app/api/communitiesApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from "@/components/postCard/PostCard";

const CommunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo: user } = useSelector((state) => state.auth);

  const { data: community, isLoading, isError } = useGetCommunityByIdQuery(id);
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] =
    useLeaveCommunityMutation();
  const [deleteCommunity] = useDeleteCommunityMutation();

  if (isLoading) return <CommunitySkeleton />;
  if (isError || !community)
    return (
      <div className="container py-20 text-center font-bold">
        Community not found.
      </div>
    );

  const isMember = community.members?.some((m) => m._id === user?._id);
  const isCreator = user?._id === community.createdBy?._id;

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await leaveCommunity(community._id).unwrap();
        toast.success(`Left d/${community.name}`);
      } else {
        await joinCommunity(community._id).unwrap();
        toast.success(`Joined d/${community.name}`);
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommunity(community._id).unwrap();
      toast.success("Community deleted");
      navigate("/explore");
    } catch (err) {
      toast.error("Failed to delete community");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-32 bg-muted/30 border-b" />

      <div className="container max-w-5xl px-4 relative -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <header className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-sm rounded-lg">
                    <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold uppercase">
                      {community.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight">
                        d/{community.name}
                      </h1>
                      {isCreator && (
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="px-2 py-0 text-[10px] bg-muted/50 text-muted-foreground border-transparent uppercase tracking-wider font-bold"
                      >
                        {community.category || "General"}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />{" "}
                        {community.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-1">
                  <Button
                    variant={isMember ? "outline" : "default"}
                    className="h-9 px-6 text-xs font-bold"
                    disabled={isJoining || isLeaving}
                    onClick={handleJoinLeave}
                  >
                    {isMember ? "Joined" : "Join"}
                  </Button>

                  {isMember && (
                    <Button
                      onClick={() =>
                        navigate(`/community/${community._id}/create-post`)
                      }
                      size="sm"
                      className="h-9 font-bold"
                    >
                      <Plus className="mr-2 h-3.5 w-3.5" /> Post
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toast.success("Link copied")}
                      >
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </DropdownMenuItem>
                      {isCreator && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/community/${community._id}/edit`)
                            }
                          >
                            <Settings className="mr-2 h-4 w-4" /> Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Community
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {community.description ||
                  "A space for discussion and sharing thoughts."}
              </p>
            </header>

            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="bg-transparent h-10 p-0 gap-6 border-b rounded-none w-full justify-start">
                <TabsTrigger
                  value="feed"
                  className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
                >
                  Feed
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
                >
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="pt-6">
                <AnimatePresence mode="wait">
                  {community.posts?.length ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      {community.posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </motion.div>
                  ) : (
                    <div className="py-20 text-center border-border shadow-none rounded-md bg-muted/5">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                        No posts yet
                      </h3>
                    </div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="md:col-span-4 space-y-6">
            <Card className="border shadow-none rounded-md overflow-hidden">
              <CardHeader className="p-5 pb-3 border-b bg-muted/20">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground uppercase font-bold tracking-tight">
                      Founder
                    </span>
                    <span className="font-bold">
                      u/{community.createdBy?.username}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground uppercase font-bold tracking-tight">
                      Created
                    </span>
                    <span className="font-bold">
                      {new Date(community.createdAt).toLocaleDateString(
                        undefined,
                        { month: "long", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Members
                  </h4>
                  <div className="flex -space-x-2">
                    {community.members?.slice(0, 5).map((m, i) => (
                      <Avatar
                        key={i}
                        className="h-8 w-8 border-2 border-background rounded-full"
                      >
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${m.username}`}
                        />
                        <AvatarFallback>{m.username[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {community.members?.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        +{community.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-[10px] text-muted-foreground/60 leading-relaxed uppercase font-bold tracking-tight px-1">
              Follow the community guidelines to maintain a healthy discussion
              environment.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

const CommunitySkeleton = () => (
  <div className="min-h-screen bg-background animate-pulse">
    <div className="h-32 bg-muted/30 border-b" />
    <div className="container max-w-5xl -mt-16 space-y-10">
      <div className="flex gap-4 items-end">
        <div className="h-24 w-24 bg-muted rounded-lg border-4 border-background shadow-sm" />
        <div className="space-y-2 pb-1">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-40 w-full bg-muted rounded" />
        </div>
        <div className="md:col-span-4">
          <div className="h-48 w-full bg-muted rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default CommunityPage;
