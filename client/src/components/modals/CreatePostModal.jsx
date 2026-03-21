import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCreatePostMutation } from "../../app/api/postsApi";
import { useGetCommunitiesQuery } from "../../app/api/communitiesApi";
import { Loader2, PenSquare } from "lucide-react";
import { toast } from "sonner";

export function CreatePostModal({ children }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [communityId, setCommunityId] = useState('');
  
  const [createPost, { isLoading }] = useCreatePostMutation();
  const { data: communities } = useGetCommunitiesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await createPost({ 
        title, 
        content, 
        communityId: communityId || null 
      }).unwrap();
      
      toast.success("Post created successfully!");
      setOpen(false);
      setTitle('');
      setContent('');
      setCommunityId('');
    } catch (error) {
      toast.error(error.data?.message || "Failed to create post");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="rounded-full shadow-sm"><PenSquare className="w-4 h-4 mr-2" /> New Post</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 border-border/60 shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">Create a Post</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Share your thoughts, ask a question, or start a discussion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="community" className="text-foreground/90 font-medium">Community (Optional)</Label>
            <Select value={communityId} onValueChange={setCommunityId}>
              <SelectTrigger className="rounded-xl border-border/60 bg-muted/20 h-11 transition-all focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60">
                <SelectItem value="none" className="rounded-lg">None (General)</SelectItem>
                {communities?.map((community) => (
                  <SelectItem key={community._id} value={community._id} className="rounded-lg">
                    c/{community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground/90 font-medium">Title</Label>
            <Input 
              id="title" 
              placeholder="Give your post a catchy title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-border/60 bg-muted/20 h-11 transition-all focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="text-foreground/90 font-medium">Content</Label>
            <Textarea 
              id="content" 
              placeholder="What's on your mind?" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none rounded-xl border-border/60 bg-muted/20 p-3 transition-all focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="rounded-full px-6 font-medium h-10 border-border/60"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-full px-8 font-medium h-10 shadow-sm transition-all"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
