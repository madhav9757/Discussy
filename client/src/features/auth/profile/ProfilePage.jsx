"use client";

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Globe,
  Lock,
  Edit,
  MapPin,
  MessageSquare,
  Hash,
  Settings,
  ShieldCheck,
  Share2,
} from "lucide-react";

import {
  useGetProfileQuery,
  useGetUserByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../../app/api/userApi.js";

import UserListModal from "../../../components/UserListModal/UserListModal.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const isOwnProfile = !id || id === userInfo?._id;

  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    refetch: refetchOwnProfile,
  } = useGetProfileQuery(undefined, { skip: !isOwnProfile });

  const {
    data: otherUserData,
    isLoading: isLoadingOther,
    isError: isErrorOther,
    refetch: refetchOtherProfile,
  } = useGetUserByIdQuery(id, { skip: isOwnProfile });

  const data = isOwnProfile ? profileData : otherUserData;
  const isLoading = isOwnProfile ? isLoadingProfile : isLoadingOther;
  const isError = isOwnProfile ? isErrorProfile : isErrorOther;

  const [followUser, { isLoading: isLoadingFollow }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isLoadingUnfollow }] =
    useUnfollowUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);

  useEffect(() => {
    if (!isLoadingFollow && !isLoadingUnfollow) {
      isOwnProfile ? refetchOwnProfile() : refetchOtherProfile();
    }
  }, [
    isLoadingFollow,
    isLoadingUnfollow,
    isOwnProfile,
    refetchOwnProfile,
    refetchOtherProfile,
  ]);

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !data?._id) return <ProfileErrorState />;

  const isFollowing = data.followers?.some((f) => f._id === userInfo?._id);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-32 bg-muted/30 border-b" />

      <div className="container max-w-5xl px-4 relative -mt-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-6">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 border-4 border-background shadow-sm rounded-lg">
                <AvatarImage
                  src={data.image}
                  alt={data.username}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl bg-muted text-muted-foreground font-bold uppercase">
                  {data.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="absolute -bottom-1 -right-1 p-2 bg-foreground text-background rounded-md shadow-sm border border-background"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {data.username}
                  </h1>
                  {data.isCreator && (
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {data.isPrivate ? "Private Account" : "Public Account"}
                </p>
              </div>

              {data.bio && (
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {data.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 py-2 border-y border-border/50">
                <button
                  onClick={() => {
                    setModalTitle("Followers");
                    setModalUsers(data.followers);
                    setIsModalOpen(true);
                  }}
                  className="text-sm"
                >
                  <span className="font-bold text-foreground">
                    {data.followers?.length || 0}
                  </span>
                  <span className="ml-1 text-muted-foreground">Followers</span>
                </button>
                <button
                  onClick={() => {
                    setModalTitle("Following");
                    setModalUsers(data.following);
                    setIsModalOpen(true);
                  }}
                  className="text-sm"
                >
                  <span className="font-bold text-foreground">
                    {data.following?.length || 0}
                  </span>
                  <span className="ml-1 text-muted-foreground">Following</span>
                </button>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button
                    asChild
                    className="h-9 flex-1 text-xs font-bold"
                    variant="outline"
                  >
                    <Link to="/profile/edit">
                      <Settings className="mr-2 h-3.5 w-3.5" /> Edit Profile
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      className="h-9 flex-1 text-xs font-bold transition-all"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() =>
                        isFollowing
                          ? unfollowUser(data._id)
                          : followUser(data._id)
                      }
                      disabled={isLoadingFollow || isLoadingUnfollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button variant="outline" className="h-9 w-9">
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Joined{" "}
                    {new Date(data.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {data.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="bg-transparent h-10 p-0 gap-6 border-b rounded-none w-full justify-start">
                <TabsTrigger
                  value="posts"
                  className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="created"
                  className="text-xs font-bold uppercase tracking-widest px-0 h-full border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-none"
                >
                  Communities
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <AnimatePresence mode="wait">
                  <TabsContent value="posts">
                    <ContentList
                      items={data.posts}
                      type="post"
                      emptyMessage="No posts yet."
                    />
                  </TabsContent>
                  <TabsContent value="created">
                    <ContentList
                      items={data.createdCommunities}
                      type="community"
                      emptyMessage="No communities created."
                    />
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

const ContentList = ({ items, type, emptyMessage }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
    className="space-y-3"
  >
    {items?.length > 0 ? (
      items.map((item) => (
        <Card
          key={item._id}
          className="shadow-none border-border/50 hover:bg-muted/30 transition-colors rounded-md overflow-hidden"
        >
          <Link
            to={
              type === "post" ? `/posts/${item._id}` : `/community/${item._id}`
            }
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                  {type === "post" ? (
                    <MessageSquare className="h-4 w-4" />
                  ) : (
                    <Hash className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold truncate max-w-[200px] md:max-w-md">
                    {type === "post" ? item.title : `d/${item.name}`}
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    {new Date(item.createdAt).toLocaleDateString()}
                    {type === "community" &&
                      ` • ${item.members?.length || 0} Members`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-20 text-center border-border shadow-none rounded-md bg-muted/5">
        <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
          {emptyMessage}
        </p>
      </div>
    )}
  </motion.div>
);

const ProfileSkeleton = () => (
  <div className="min-h-screen animate-pulse">
    <div className="h-32 bg-muted/30" />
    <div className="container max-w-5xl px-4 relative -mt-16">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-6">
          <div className="h-32 w-32 bg-muted rounded-lg border-4 border-background" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded" />
          </div>
        </div>
        <div className="md:col-span-8 space-y-6 pt-20">
          <div className="h-10 w-full bg-muted rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileErrorState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <h2 className="text-2xl font-bold tracking-tight">User not found</h2>
    <p className="text-muted-foreground mt-2 text-sm max-w-xs">
      The profile you are looking for does not exist.
    </p>
    <Button
      asChild
      className="mt-8 px-8 h-10 border-foreground border-2 hover:bg-foreground hover:text-background transition-colors"
      variant="outline"
    >
      <Link to="/">Back to Home</Link>
    </Button>
  </div>
);

export default ProfilePage;
