import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, FileText, ImageIcon, Loader2, 
  Save, X, ArrowLeft, Camera, Fingerprint 
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../../../../app/api/userApi.js';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge.jsx';
import { cn } from '@/lib/utils.js';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { data: userProfile, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating, isSuccess }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    image: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        image: userProfile.image || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Profile updated successfully!');
      navigate('/profile');
    }
  }, [isSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const isModified = 
    formData.username !== (userProfile?.username || '') ||
    formData.email !== (userProfile?.email || '') ||
    formData.bio !== (userProfile?.bio || '') ||
    formData.image !== (userProfile?.image || '');

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading settings...</p>
    </div>
  );

  return (
    <div className="container max-w-2xl py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "out" }}
      >
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="group text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
            Back to Profile
          </Button>
          
          {isModified && (
            <Badge variant="outline" className="animate-in fade-in zoom-in bg-primary/5 text-primary border-primary/20">
              Unsaved Changes
            </Badge>
          )}
        </div>

        <Card className="border-border/40 bg-background/50 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/10 via-muted to-primary/5 border-b" />
          
          <CardHeader className="relative pb-4">
            <div className="absolute -top-12 left-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={formData.image} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-muted text-muted-foreground">
                    {formData.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="pt-10">
              <CardTitle className="text-2xl font-black tracking-tight">Profile Settings</CardTitle>
              <CardDescription className="text-balance">
                Your profile is public. Others can see your bio, avatar, and shared posts.
              </CardDescription>
            </div>
          </CardHeader>

          <Separator className="opacity-50" />
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8 pt-6">
              {/* Identity Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <Fingerprint className="h-4 w-4" />
                  <span>Public Identity</span>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-bold uppercase text-muted-foreground/70">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10 h-11 border-border/60 focus:ring-primary/20"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground/70">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 h-11 border-border/60 focus:ring-primary/20"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-xs font-bold uppercase text-muted-foreground/70">Profile Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="pl-10 h-11 border-border/60 focus:ring-primary/20"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Bio / Description</span>
                  </div>
                  <span className={cn(
                    "font-mono",
                    formData.bio.length > 150 ? "text-destructive" : "text-muted-foreground/50"
                  )}>
                    {formData.bio.length}/160
                  </span>
                </div>
                
                <div className="relative">
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="min-h-[120px] resize-none border-border/60 focus:ring-primary/20 pt-3 leading-relaxed"
                    placeholder="Tell your story..."
                    maxLength={160}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3 pt-8 pb-8 px-6 border-t bg-muted/5">
              <Button 
                type="submit" 
                className="flex-1 font-bold h-11 shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]"
                disabled={!isModified || isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 font-bold h-11 border-border/60"
                onClick={() => navigate('/profile')}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default UpdateProfile;