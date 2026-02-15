import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { useCreatePostMutation } from "../../../app/api/postsApi.js";
import {
  useGetCommunityByIdQuery,
  useGetCommunitiesQuery,
} from "../../../app/api/communitiesApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CreatePost = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isGeneralPost = location.pathname === "/new-post";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState(id || "");

  const { data: community } = useGetCommunityByIdQuery(id, { skip: !id });
  const { data: communities = [] } = useGetCommunitiesQuery(undefined, {
    skip: !isGeneralPost,
  });
  const [createPost, { isLoading: isSubmitting }] = useCreatePostMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please enter a title");
    if (!communityId) return toast.error("Please select a community");

    try {
      await createPost({
        title: title.trim(),
        content,
        community: communityId,
      }).unwrap();
      toast.success("Post published");
      navigate(id ? `/community/${id}` : `/community/${communityId}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to publish post");
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">New Post</h1>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !communityId}
            size="sm"
            className="h-9 px-6 font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Post"
            )}
          </Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {isGeneralPost ? (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Community
              </Label>
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger className="h-10 text-sm border-border bg-card">
                  <SelectValue placeholder="Select where to post" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((comm) => (
                    <SelectItem
                      key={comm._id}
                      value={comm._id}
                      className="text-sm"
                    >
                      d/{comm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 w-fit">
              <Avatar className="h-6 w-6 rounded border">
                <AvatarImage src={community?.image} />
                <AvatarFallback className="text-[8px] font-bold">
                  {community?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-bold">d/{community?.name}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto"
            />

            <div className="h-px bg-border" />

            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] border-none p-0 focus-visible:ring-0 text-base leading-relaxed resize-none placeholder:text-muted-foreground/30 shadow-none"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePost;
