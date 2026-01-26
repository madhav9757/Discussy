'use client';

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Users, UserPlus, Calendar, Globe, Lock, Edit, 
  MapPin, MessageSquare, Plus, Hash, 
  Settings, ShieldCheck, Ghost, Share2, MoreHorizontal
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
    <div className="min-h-screen bg-[#09090b]">
      {/* Header / Banner Area */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gradient-to-br from-primary/20 via-zinc-900 to-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
      </div>

      <div className="container max-w-6xl px-4 md:px-6 relative -mt-20 md:-mt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative inline-block group">
              <Avatar className="h-40 w-40 md:h-48 md:w-48 border-[6px] border-[#09090b] shadow-2xl rounded-[2.5rem]">
                <AvatarImage src={data.image} alt={data.username} className="object-cover" />
                <AvatarFallback className="text-5xl bg-zinc-900 text-primary font-black italic">
                  {data.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Link to="/profile/edit" className="absolute bottom-2 right-2 p-2 bg-primary text-black rounded-xl shadow-xl hover:scale-110 transition-transform">
                  <Edit className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white">{data.username}</h1>
                  {data.isCreator && <ShieldCheck className="h-6 w-6 text-primary fill-primary/10" />}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-white/10 bg-white/5">
                    {data.isPrivate ? <Lock className="mr-1 h-3 w-3" /> : <Globe className="mr-1 h-3 w-3" />}
                    {data.isPrivate ? 'Private' : 'Public'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-white/10 bg-white/5">
                    ID: {data._id.slice(-6)}
                  </Badge>
                </div>
              </div>

              {data.bio && (
                <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                  "{data.bio}"
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => { setModalTitle('Followers'); setModalUsers(data.followers); setIsModalOpen(true); }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all text-left group">
                  <div className="text-xl font-black italic text-white group-hover:text-primary">{data.followers?.length || 0}</div>
                  <div className="text-[10px] uppercase font-bold tracking-tighter text-zinc-500">Followers</div>
                </button>
                <button onClick={() => { setModalTitle('Following'); setModalUsers(data.following); setIsModalOpen(true); }} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all text-left group">
                  <div className="text-xl font-black italic text-white group-hover:text-primary">{data.following?.length || 0}</div>
                  <div className="text-[10px] uppercase font-bold tracking-tighter text-zinc-500">Following</div>
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                {isOwnProfile ? (
                  <Button asChild className="h-12 w-full font-black uppercase tracking-tight rounded-xl shadow-lg shadow-primary/10" variant="default">
                    <Link to="/profile/edit"><Settings className="mr-2 h-4 w-4" /> System Config</Link>
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      className={cn(
                        "h-12 flex-1 font-black uppercase tracking-tight rounded-xl transition-all",
                        isFollowing ? "bg-zinc-800 text-white hover:bg-red-500/10 hover:text-red-500" : ""
                      )} 
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() => (isFollowing ? unfollowUser(data._id) : followUser(data._id))}
                      disabled={isLoadingFollow || isLoadingUnfollow}
                    >
                      {isFollowing ? 'Unfollow' : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>}
                    </Button>
                    <Button variant="outline" className="h-12 w-12 rounded-xl border-white/10 bg-white/5"><Share2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary/40" />
                  <span>Established {new Date(data.createdAt).getFullYear()}</span>
                </div>
                {data.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary/40" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Content Feed */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-white/5 rounded-none h-14 p-0 gap-8">
                <TabsTrigger value="posts" className="tab-style-v3">Transmission Feed</TabsTrigger>
                <TabsTrigger value="created" className="tab-style-v3">Founded Tribes</TabsTrigger>
                <TabsTrigger value="joined" className="tab-style-v3">Alliances</TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <AnimatePresence mode="wait">
                  <TabsContent value="posts">
                    <ContentList items={data.posts} type="post" emptyMessage="Zero transmissions found." />
                  </TabsContent>
                  <TabsContent value="created">
                    <ContentList items={data.createdCommunities} type="community" emptyMessage="No tribes founded." />
                  </TabsContent>
                  <TabsContent value="joined">
                    <ContentList items={data.joinedCommunities} type="community" emptyMessage="Zero alliances established." />
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
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
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="grid grid-cols-1 gap-4"
  >
    {items?.length > 0 ? (
      items.map((item) => (
        <Card key={item._id} className="group overflow-hidden bg-white/[0.02] border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all duration-300 rounded-3xl">
          <Link to={type === 'post' ? `/posts/${item._id}` : `/community/${item._id}`}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-primary group-hover:text-black transition-all duration-300">
                  {type === 'post' ? <MessageSquare className="h-6 w-6" /> : <Hash className="h-6 w-6" />}
                </div>
                <div className="space-y-1">
                  <h3 className="font-black italic uppercase tracking-tighter text-lg text-white group-hover:text-primary transition-colors">
                    {type === 'post' ? item.title : `d/${item.name}`}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-1 opacity-60"><Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    {type === 'community' && <span className="text-primary">{item.members?.length || 0} Members</span>}
                  </div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full text-zinc-600 hover:text-primary hover:bg-primary/10">
                <Plus className="h-5 w-5" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-[3rem] border-white/5 bg-white/[0.01]">
        <Ghost className="h-16 w-16 text-zinc-800 mb-4" />
        <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">{emptyMessage}</p>
      </div>
    )}
  </motion.div>
);

// --- HELPER COMPONENTS TO FIX THE REFERENCE ERRORS ---

const ProfileSkeleton = () => (
  <div className="min-h-screen bg-[#09090b] animate-pulse">
    {/* Banner Skeleton */}
    <div className="h-48 md:h-64 lg:h-80 w-full bg-zinc-900/50" />
    
    <div className="container max-w-6xl px-4 md:px-6 relative -mt-20 md:-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="h-40 w-40 md:h-48 md:w-48 bg-zinc-800 rounded-[2.5rem] border-[6px] border-[#09090b]" />
          <div className="space-y-4">
            <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-zinc-900 rounded-full" />
              <div className="h-5 w-16 bg-zinc-900 rounded-full" />
            </div>
            <div className="h-20 w-full bg-zinc-900/50 rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-zinc-900 rounded-2xl" />
              <div className="h-20 bg-zinc-900 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="lg:col-span-8 space-y-6 pt-24 lg:pt-32">
          <div className="h-12 w-full bg-zinc-900 rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full bg-zinc-900/40 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileErrorState = () => (
  <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center py-32 text-center px-6">
    <div className="h-24 w-24 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/20">
      <Ghost className="h-12 w-12" />
    </div>
    <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">
      Explorer Lost
    </h2>
    <p className="text-zinc-500 mt-4 max-w-xs font-medium leading-relaxed">
      The user profile you are trying to intercept does not exist in our database.
    </p>
    <Button asChild variant="default" className="mt-10 font-black uppercase tracking-tight h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105">
      <Link to="/">Return to Nexus</Link>
    </Button>
  </div>
);

export default ProfilePage ;