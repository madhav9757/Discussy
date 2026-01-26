import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { 
  Users, Calendar, User as UserIcon, Plus, Trash2, 
  LogOut, UserPlus, MoreVertical, ArrowLeft, 
  MessageSquare, Settings, Info, Share2, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetCommunityByIdQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useDeleteCommunityMutation,
} from "@/app/api/communitiesApi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PostCard from "@/components/postCard/PostCard";

const CommunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo: user } = useSelector((state) => state.auth);

  const { data: community, isLoading, isError } = useGetCommunityByIdQuery(id);
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();
  const [deleteCommunity, { isLoading: isDeleting }] = useDeleteCommunityMutation();

  if (isLoading) return <CommunitySkeleton />;
  if (isError || !community) return <div className="container py-20 text-center font-bold">Community not found.</div>;

  const isMember = community.members?.some((m) => m._id === user?._id);
  const isCreator = user?._id === community.createdBy?._id;

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await leaveCommunity(community._id).unwrap();
        toast.success(`You left d/${community.name}`);
      } else {
        await joinCommunity(community._id).unwrap();
        toast.success(`Welcome to d/${community.name}!`);
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommunity(community._id).unwrap();
      toast.success("Tribe dissolved successfully");
      navigate("/explore");
    } catch (err) {
      toast.error("Failed to delete community");
    }
  };

  return (
    <div className="min-h-screen bg-background/50">
      {/* Dynamic Hero Banner */}
      <div className="h-48 lg:h-64 w-full bg-primary/5 border-b relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-background/50 backdrop-blur-md border border-border/50 rounded-full hover:bg-background/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="container max-w-6xl -mt-16 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Side */}
          <div className="lg:col-span-8 space-y-8">
            <header className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="flex items-end gap-5">
                  <Avatar className="h-24 w-24 lg:h-32 lg:w-32 rounded-[2rem] border-4 border-background shadow-2xl">
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-black italic">
                      {community.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                       <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase italic">
                        d/{community.name}
                      </h1>
                      {isCreator && <ShieldCheck className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                        {community.category || "General"}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" /> {community.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:mb-2">
                  <Button 
                    variant={isMember ? "outline" : "default"} 
                    className="rounded-full px-8 font-bold h-11"
                    disabled={isJoining || isLeaving}
                    onClick={handleJoinLeave}
                  >
                    {isMember ? <LogOut className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    {isMember ? "Leave" : "Join"}
                  </Button>
                  
                  {isMember && (
                    <Button onClick={() => navigate(`/community/${community._id}/create-post`)} className="rounded-full h-11 px-6 font-bold shadow-lg shadow-primary/20">
                      <Plus className="mr-2 h-4 w-4" /> Post
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-full h-11 w-11">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl">
                      <DropdownMenuItem className="py-3 cursor-pointer">
                        <Share2 className="mr-2 h-4 w-4" /> Share Community
                      </DropdownMenuItem>
                      <DropdownMenuItem className="py-3 cursor-pointer">
                        <Info className="mr-2 h-4 w-4" /> Community Info
                      </DropdownMenuItem>
                      {isCreator && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="py-3 cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" /> Tribe Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleDelete} className="text-destructive py-3 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Dissolve Tribe
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl font-medium">
                {community.description || "Welcome to the hub. Start a conversation or explore recent thoughts."}
              </p>
            </header>

            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-8">
                <TabsTrigger value="feed" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-3 font-bold text-sm tracking-widest uppercase">
                  Discussion Feed
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 pb-3 font-bold text-sm tracking-widest uppercase">
                  Members List
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="feed" className="pt-6">
                <AnimatePresence mode="wait">
                  {community.posts?.length ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
                      {community.posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="border-2 border-dashed bg-muted/5 py-12">
                        <CardContent className="flex flex-col items-center text-center space-y-4">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <MessageSquare size={32} />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">The feed is empty</h3>
                            <p className="text-muted-foreground max-w-[280px]">Be the visionary this community needs and start the first discussion.</p>
                          </div>
                          {isMember && (
                            <Button onClick={() => navigate(`/community/${community._id}/create-post`)} variant="outline" className="rounded-full">
                              Create the first post
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Section */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">About Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserIcon className="h-4 w-4" />
                      <span>Founder</span>
                    </div>
                    <span className="font-bold">u/{community.createdBy?.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Established</span>
                    </div>
                    <span className="font-bold">
                      {new Date(community.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border/40" />
                
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Top Contributors</h4>
                  <div className="flex -space-x-3 overflow-hidden">
                    {community.members?.slice(0, 5).map((m, i) => (
                      <Avatar key={i} className="inline-block border-2 border-background h-10 w-10">
                         <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${m.username}`} />
                         <AvatarFallback>{m.username[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {community.members?.length > 5 && (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted border-2 border-background text-[10px] font-bold">
                        +{community.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="secondary" className="w-full font-bold h-11" onClick={() => navigate(`/community/${community._id}/info`)}>
                  View Guidelines
                </Button>
              </CardContent>
            </Card>

            <div className="px-4 text-[11px] text-muted-foreground leading-relaxed">
              By joining this tribe, you agree to follow the specific rules set by the moderation team. Respect the community.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const CommunitySkeleton = () => (
  <div className="min-h-screen bg-background">
    <Skeleton className="h-64 w-full rounded-none" />
    <div className="container max-w-6xl -mt-16 space-y-12">
      <div className="flex gap-6 items-end">
        <Skeleton className="h-32 w-32 rounded-[2rem]" />
        <div className="space-y-3 pb-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export default CommunityPage;