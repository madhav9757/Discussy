import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  MessageSquare
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
  if (isError || !community) return <div className="container py-20 text-center">Community not found.</div>;

  const isMember = community.members?.some((m) => m._id === user?._id);
  const isCreator = user?._id === community.createdBy?._id;

  const handleJoinLeave = async () => {
    try {
      if (isMember) {
        await leaveCommunity(community._id).unwrap();
        toast.success("Left community");
      } else {
        await joinCommunity(community._id).unwrap();
        toast.success("Joined community");
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
      {/* Header Banner */}
      <div className="h-32 w-full bg-muted/30 border-b relative" />

      <div className="container max-w-6xl -mt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <header className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur">
                    Community
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight">{community.name}</h1>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant={isMember ? "outline" : "default"} 
                    className="rounded-full px-6"
                    disabled={isJoining || isLeaving}
                    onClick={handleJoinLeave}
                  >
                    {isMember ? (
                      <><LogOut className="mr-2 h-4 w-4" /> Leave</>
                    ) : (
                      <><UserPlus className="mr-2 h-4 w-4" /> Join</>
                    )}
                  </Button>
                  
                  {isMember && (
                    <Button onClick={() => navigate(`/community/${community._id}/create-post`)} className="rounded-full">
                      <Plus className="mr-2 h-4 w-4" /> Create Post
                    </Button>
                  )}

                  {isCreator && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Community
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {community.description || "A space for enthusiasts to share and discuss."}
              </p>
            </header>

            <Separator className="bg-border/60" />

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary/60" />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>
              
              {community.posts?.length ? (
                <div className="grid gap-4">
                  {community.posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed bg-muted/20">
                  <CardContent className="flex flex-col items-center py-12 text-center space-y-3">
                    <p className="text-muted-foreground">The conversation hasn't started yet.</p>
                    {isMember && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/community/${community._id}/create-post`)}>
                        Post first thought
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Created by</span>
                    <span className="font-medium ml-auto">u/{community.createdBy?.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Established</span>
                    <span className="font-medium ml-auto">
                      {new Date(community.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-3 w-full hover:bg-muted/50 p-1 -m-1 rounded transition-colors">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Members</span>
                        <span className="font-medium ml-auto">{community.members?.length || 0}</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Community Members</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[400px] overflow-y-auto space-y-4 py-4">
                        {community.members.map((member) => (
                          <div key={member._id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-border/50">
                                <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${member.username}`} />
                                <AvatarFallback>{member.username[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none">
                                  {member.username}
                                  {member._id === user?._id && <span className="text-[10px] ml-2 text-primary font-bold">YOU</span>}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {member._id === community.createdBy?._id ? "Administrator" : "Member"}
                                </span>
                              </div>
                            </div>
                            {member._id === community.createdBy?._id && (
                              <Badge variant="secondary" className="h-5 text-[10px] px-1.5 bg-orange-100 text-orange-700 hover:bg-orange-100 border-none">
                                Staff
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </aside>

        </div>
      </div>
    </div>
  );
};

const CommunitySkeleton = () => (
  <div className="container max-w-6xl py-20 space-y-12">
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-full max-w-2xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
      <div className="lg:col-span-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  </div>
);

export default CommunityPage;