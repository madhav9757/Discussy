import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Loader2, Save, X, 
  History, MessageSquare, Eye 
} from "lucide-react";
import { toast } from "sonner";

import {
    useGetPostByIdQuery,
    useUpdatePostMutation,
} from "../../../app/api/postsApi.js";
import { useGetCommunityByIdQuery } from "../../../app/api/communitiesApi.js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const EditPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: post, isLoading: postLoading } = useGetPostByIdQuery(id);
    const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const communityId = post?.community?._id;
    const { data: community } = useGetCommunityByIdQuery(communityId, {
        skip: !communityId,
    });

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
        }
    }, [post]);

    const isModified = title !== post?.title || content !== post?.content;

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Title is required");

        try {
            await updatePost({ id, title: title.trim(), content }).unwrap();
            toast.success("Changes saved successfully!");
            navigate(`/posts/${id}`);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update post");
        }
    };

    if (postLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            <p className="text-muted-foreground animate-pulse font-medium">Retrieving post data...</p>
        </div>
    );

    return (
        <div className="container max-w-4xl py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Top Actions */}
                <div className="flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="group text-muted-foreground"
                        onClick={() => navigate(-1)}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-muted/50 text-[10px] uppercase tracking-widest py-1">
                           <History className="h-3 w-3 mr-1" /> Draft Mode
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Edit Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border/50 shadow-xl bg-background/50 backdrop-blur-md">
                            <CardHeader className="border-b bg-muted/20">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Edit Post
                                </CardTitle>
                            </CardHeader>

                            <form onSubmit={handleUpdate}>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Headline</label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="text-lg font-bold h-12 border-border/60 focus:ring-primary/20"
                                            placeholder="Post title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Body Content</label>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="min-h-[300px] resize-none leading-relaxed border-border/60 focus:ring-primary/20"
                                            placeholder="What's on your mind?"
                                        />
                                    </div>
                                </CardContent>

                                <CardFooter className="flex gap-3 border-t bg-muted/10 p-6">
                                    <Button 
                                        type="submit" 
                                        className="flex-1 font-bold shadow-lg shadow-primary/20"
                                        disabled={!isModified || isUpdating}
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        Save Changes
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="flex-1 font-bold"
                                        onClick={() => navigate(-1)}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Sidebar / Context */}
                    <div className="space-y-6">
                        {community && (
                            <Card className="border-border/40 bg-primary/5 overflow-hidden">
                                <div className="h-16 bg-gradient-to-br from-primary/20 to-transparent" />
                                <CardContent className="relative pt-0">
                                    <Avatar className="h-16 w-16 absolute -top-8 left-4 border-4 border-background rounded-2xl shadow-lg">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${community.name}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-black">
                                            {community.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="pt-10">
                                        <h4 className="font-black text-lg">d/{community.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {community.description}
                                        </p>
                                        <Separator className="my-4 opacity-50" />
                                        <Link 
                                            to={`/community/${community._id}`} 
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            Visit Community Hub →
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-dashed bg-transparent border-border/60">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                    Editing Tips
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-[12px] text-muted-foreground space-y-3">
                                <p>• Be clear and concise with your new headline.</p>
                                <p>• You can update the body to fix typos or add more context.</p>
                                <p>• Changes will be visible immediately to all members of <strong>d/{community?.name}</strong>.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default EditPostPage;