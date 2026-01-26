import React, { useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenLine, ChevronLeft, Loader2, Send, 
  Info, Eye, Sparkles, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

import { useCreatePostMutation } from '../../../app/api/postsApi.js';
import { useGetCommunityByIdQuery, useGetCommunitiesQuery } from '../../../app/api/communitiesApi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

  // Find selected community name for preview if in general post mode
  const selectedCommObj = isGeneralPost ? communities.find(c => c._id === communityId) : community;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Please enter a post title');
    if (!communityId) return toast.error('Please select a community');

    try {
      await createPost({ title: title.trim(), content, community: communityId }).unwrap();
      toast.success('Broadcast sent.');
      navigate(id ? `/community/${id}` : `/community/${communityId}`);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to publish post');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full text-zinc-400" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">New Broadcast</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !title.trim() || !communityId}
            size="sm"
            className="font-black italic uppercase tracking-tight px-6 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
          </Button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor Side */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 border-r border-white/5">
          <div className="max-w-2xl mx-auto space-y-10">
            <div className="space-y-4">
               {isGeneralPost ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Target Tribe</Label>
                  <Select value={communityId} onValueChange={setCommunityId}>
                    <SelectTrigger className="h-14 bg-white/5 border-white/10 text-zinc-200">
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      {communities.map((comm) => (
                        <SelectItem key={comm._id} value={comm._id}>d/{comm.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit">
                  <Avatar className="h-8 w-8 rounded-lg border border-white/10">
                    <AvatarImage src={community?.image} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {community?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold">d/{community?.name}</span>
                </div>
              )}

              <div className="space-y-2">
                <Input
                  placeholder="The headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-4xl font-black italic tracking-tighter bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-zinc-800"
                />
              </div>

              <Separator className="bg-white/5" />

              <Textarea
                placeholder="Compose your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] bg-transparent border-none p-0 focus-visible:ring-0 text-lg leading-relaxed resize-none placeholder:text-zinc-800"
              />
            </div>
          </div>
        </div>

        {/* Right: Preview Side (Desktop Only) */}
        <div className="hidden lg:flex w-[450px] bg-[#0c0c0e] flex-col p-12 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
           
           <div className="flex items-center gap-2 mb-8 opacity-40">
              <Eye className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Projection</span>
           </div>

           <motion.div
             initial={false}
             animate={{ opacity: title || content ? 1 : 0.3 }}
             className="relative z-10"
           >
             <Card className="bg-white/[0.03] border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-xl">
               <CardContent className="p-8 space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-primary/20 text-primary flex items-center justify-center text-[8px] font-black">d/</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {selectedCommObj?.name || "Tribe"}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[10px] text-zinc-600 uppercase font-bold">Just now</span>
                 </div>

                 <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight leading-tight italic uppercase">
                      {title || "Untitled Transmission"}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-6 leading-relaxed">
                      {content || "Your message will appear here in the community feed..."}
                    </p>
                 </div>

                 <div className="pt-4 flex items-center gap-4 border-t border-white/5">
                    <div className="flex items-center gap-2 opacity-20">
                      <div className="h-3 w-3 rounded-full bg-zinc-500" />
                      <div className="h-2 w-12 rounded-full bg-zinc-800" />
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                       <MessageSquare className="h-3 w-3" />
                       <span className="text-[10px] font-bold tracking-widest uppercase">0 Responses</span>
                    </div>
                 </div>
               </CardContent>
             </Card>

             <div className="mt-8 p-6 rounded-2xl border border-dashed border-white/5 bg-white/[0.01] space-y-3">
               <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Guidelines</span>
               </div>
               <p className="text-[11px] text-zinc-500 leading-relaxed">
                 You are broadcasting to a verified community. Ensure your content aligns with the tribe's manifesto to avoid moderation actions.
               </p>
             </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;