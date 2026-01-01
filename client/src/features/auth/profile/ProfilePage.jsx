import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Users, UserPlus, Calendar, Globe, Lock, Edit, 
  MapPin, Link as LinkIcon, MessageSquare, Plus, Hash, 
  Settings, ShieldCheck, Ghost
} from 'lucide-react';

import {
  useGetProfileQuery,
  useGetUserByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '../../../app/api/userApi.js';

import UserListModal from '../../../components/UserListModal/UserListModal.jsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const isOwnProfile = !id || id === userInfo?._id;

  const { data: profileData, isLoading: isLoadingProfile, isError: isErrorProfile, refetch: refetchOwnProfile } = 
    useGetProfileQuery(undefined, { skip: !isOwnProfile });

  const { data: otherUserData, isLoading: isLoadingOther, isError: isErrorOther, refetch: refetchOtherProfile } = 
    useGetUserByIdQuery(id, { skip: isOwnProfile });

  const data = isOwnProfile ? profileData : otherUserData;
  const isLoading = isOwnProfile ? isLoadingProfile : isLoadingOther;
  const isError = isOwnProfile ? isErrorProfile : isErrorOther;

  const [followUser, { isLoading: isLoadingFollow }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isLoadingUnfollow }] = useUnfollowUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState([]);

  useEffect(() => {
    if (!isLoadingFollow && !isLoadingUnfollow) {
      isOwnProfile ? refetchOwnProfile() : refetchOtherProfile();
    }
  }, [isLoadingFollow, isLoadingUnfollow, isOwnProfile, refetchOwnProfile, refetchOtherProfile]);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !data?._id) return <ProfileErrorState />;

  const isFollowing = data.followers?.some((f) => f._id === userInfo?._id);

  return (
    <div className="container max-w-6xl py-10 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Sidebar Info */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="relative group">
                <Avatar className="h-44 w-44 md:h-52 md:w-52 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">
                  <AvatarImage src={data.image} alt={data.username} className="object-cover" />
                  <AvatarFallback className="text-5xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                    {data.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button size="icon" variant="secondary" className="absolute bottom-2 right-2 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="text-center md:text-left space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-foreground">{data.username}</h1>
                  {data.isCreator && <ShieldCheck className="h-5 w-5 text-primary fill-primary/10" />}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest bg-muted/50 border-none px-2">
                    {data.isPrivate ? <Lock className="mr-1 h-3 w-3" /> : <Globe className="mr-1 h-3 w-3" />}
                    {data.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                </div>
              </div>

              {data.bio && (
                <p className="text-sm text-muted-foreground/90 leading-relaxed text-center md:text-left italic">
                  "{data.bio}"
                </p>
              )}

              <div className="w-full pt-2">
                {isOwnProfile ? (
                  <Button asChild className="w-full font-bold shadow-md hover:shadow-primary/20 transition-all" variant="default">
                    <Link to="/profile/edit"><Settings className="mr-2 h-4 w-4" /> Account Settings</Link>
                  </Button>
                ) : (
                  <Button 
                    className={cn(
                      "w-full font-bold transition-all shadow-md",
                      isFollowing ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50" : ""
                    )} 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => (isFollowing ? unfollowUser(data._id) : followUser(data._id))}
                    disabled={isLoadingFollow || isLoadingUnfollow}
                  >
                    {isFollowing ? 'Unfollow' : <><UserPlus className="mr-2 h-4 w-4" /> Follow User</>}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2 text-sm">
                <button onClick={() => { setModalTitle('Followers'); setModalUsers(data.followers); setIsModalOpen(true); }} className="hover:text-primary transition-colors flex flex-col items-center md:items-start group">
                  <span className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{data.followers?.length || 0}</span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Followers</span>
                </button>
                <div className="w-px h-8 bg-border/60 hidden md:block" />
                <button onClick={() => { setModalTitle('Following'); setModalUsers(data.following); setIsModalOpen(true); }} className="hover:text-primary transition-colors flex flex-col items-center md:items-start group">
                  <span className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{data.following?.length || 0}</span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Following</span>
                </button>
              </div>

              <Separator className="bg-border/40" />

              <div className="flex flex-col gap-2 w-full text-[13px] text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary/60" />
                  <span>Joined {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
                {data.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 p-0 gap-8">
              <TabsTrigger value="posts" className="tab-style-v2">Feed</TabsTrigger>
              <TabsTrigger value="created" className="tab-style-v2">Communities</TabsTrigger>
              <TabsTrigger value="joined" className="tab-style-v2">Joined</TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                <TabsContent value="posts">
                  <ContentList items={data.posts} type="post" emptyMessage="No thoughts shared yet." />
                </TabsContent>
                <TabsContent value="created">
                  <ContentList items={data.createdCommunities} type="community" emptyMessage="No communities founded yet." />
                </TabsContent>
                <TabsContent value="joined">
                  <ContentList items={data.joinedCommunities} type="community" emptyMessage="This user hasn't joined any tribes yet." />
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>

      <UserListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        users={modalUsers}
        currentUserId={userInfo?._id}
        viewerFollowingIds={userInfo?.following?.map((f) => f._id) || []}
        followUser={followUser}
        unfollowUser={unfollowUser}
        isLoadingFollow={isLoadingFollow}
        isLoadingUnfollow={isLoadingUnfollow}
      />
    </div>
  );
};

// Refined Tab Content Component
const ContentList = ({ items, type, emptyMessage }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    className="grid grid-cols-1 gap-4"
  >
    {items?.length > 0 ? (
      items.map((item) => (
        <Card key={item._id} className="group overflow-hidden border-border/40 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
          <Link to={type === 'post' ? `/posts/${item._id}` : `/community/${item._id}`}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {type === 'post' ? <MessageSquare className="h-6 w-6" /> : <Hash className="h-6 w-6" />}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {type === 'post' ? item.title : `d/${item.name}`}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    {type === 'community' && <span className="font-bold text-primary/70">{item.members?.length || 0} members</span>}
                  </div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full group-hover:bg-primary/10 group-hover:text-primary">
                <Plus className="h-4 w-4" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl border-muted bg-muted/10">
        <Ghost className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">{emptyMessage}</p>
      </div>
    )}
  </motion.div>
);

const ProfileSkeleton = () => (
  <div className="container max-w-6xl py-10 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      <div className="md:col-span-4 lg:col-span-3 space-y-6">
        <div className="h-52 w-52 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-8 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      </div>
      <div className="md:col-span-8 lg:col-span-9 space-y-6">
        <div className="h-12 w-full bg-muted rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-muted rounded-2xl" />)}
        </div>
      </div>
    </div>
  </div>
);

const ProfileErrorState = () => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
      <Ghost className="h-10 w-10" />
    </div>
    <h2 className="text-2xl font-black tracking-tight">User Not Found</h2>
    <p className="text-muted-foreground mt-2 max-w-xs">The explorer you are looking for has vanished into the digital void.</p>
    <Button asChild variant="default" className="mt-8 font-bold px-8 shadow-lg shadow-primary/20">
      <Link to="/">Return to Base</Link>
    </Button>
  </div>
);

export default ProfilePage;