import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenLine, Image as ImageIcon, Link as LinkIcon, 
  ChevronLeft, Loader2, Send, Hash, Info 
} from 'lucide-react';
import { toast } from 'sonner';

import { useCreatePostMutation } from '../../../app/api/postsApi.js';
import { useGetCommunityByIdQuery, useGetCommunitiesQuery } from '../../../app/api/communitiesApi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const CreatePost = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isGeneralPost = location.pathname === '/new-post';
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState(id || '');

  const { data: community, isLoading: isLoadingComm } = useGetCommunityByIdQuery(id, { skip: !id });
  const { data: communities = [] } = useGetCommunitiesQuery(undefined, { skip: !isGeneralPost });
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error('Please enter a post title');
    if (!communityId) return toast.error('Please select a community');

    try {
      await createPost({ title: title.trim(), content, community: communityId }).unwrap();
      toast.success('Post published successfully!');
      navigate(id ? `/community/${id}` : `/community/${communityId}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to publish post');
    }
  };

  return (
    <div className="container max-w-3xl py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create Post</h1>
            <p className="text-muted-foreground text-sm">Share your thoughts or questions with a tribe.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-md overflow-hidden">
            {/* Context Header */}
            <div className="bg-muted/30 p-6 border-b border-border/50">
              {isGeneralPost ? (
                <div className="space-y-4">
                  <Label className="text-xs font-bold uppercase tracking-widest text-primary">Choose a Tribe</Label>
                  <Select value={communityId} onValueChange={setCommunityId}>
                    <SelectTrigger className="w-full md:w-[300px] h-11 bg-background border-border/60">
                      <SelectValue placeholder="Search communities..." />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((comm) => (
                        <SelectItem key={comm._id} value={comm._id}>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              d/
                            </div>
                            <span>{comm.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-xl border-2 border-background shadow-sm">
                      <AvatarImage src={community?.image} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {community?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Posting to</p>
                      <h3 className="font-bold text-lg leading-tight">d/{community?.name}</h3>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="hidden sm:flex text-xs font-bold border-border/60">
                    <Link to={`/community/${id}`}>View Tribe</Link>
                  </Button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold h-14 border-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/40 shadow-none"
                    maxLength={300}
                  />
                  <Separator className="bg-border/30" />
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 border-b border-border/20 pb-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground hover:text-primary">
                      <PenLine className="h-4 w-4 mr-1.5" /> Text
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground cursor-not-allowed opacity-50">
                      <ImageIcon className="h-4 w-4 mr-1.5" /> Images
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground cursor-not-allowed opacity-50">
                      <LinkIcon className="h-4 w-4 mr-1.5" /> Link
                    </Button>
                  </div>
                  
                  <Textarea
                    placeholder="Body text (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] border-none focus-visible:ring-0 px-0 text-base leading-relaxed resize-none shadow-none"
                  />
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                  <Info className="h-3 w-3" />
                  <span>Please follow tribe rules before posting</span>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="font-bold flex-1 sm:flex-none"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="font-bold px-8 flex-1 sm:flex-none shadow-lg shadow-primary/20"
                    disabled={isSubmitting || !title.trim()}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePost;