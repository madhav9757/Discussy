import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Hash, AlignLeft, LayoutGrid, 
  ArrowLeft, Plus, Shield, Sparkles, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

import { useCreateCommunityMutation } from '../../../app/api/communitiesApi';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const [createCommunity, { isLoading, isSuccess, isError, error }] = useCreateCommunityMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Tribe created successfully!');
      navigate('/community');
    }
    if (isError) {
      toast.error(error?.data?.message || 'Failed to create community');
    }
  }, [isSuccess, isError, error, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');

    try {
      await createCommunity({ name: name.trim(), description, category }).unwrap();
    } catch (err) {
      // Handled by useEffect
    }
  };

  return (
    <div className="container max-w-6xl py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-4xl font-black tracking-tight">Create a Tribe</h1>
          <p className="text-muted-foreground">Found a new community and lead the discussion.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7">
            <Card className="border-border/50 shadow-xl overflow-hidden bg-background/50 backdrop-blur-sm">
              <CardHeader className="bg-muted/30 pb-8">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Founder Access</span>
                </div>
                <CardTitle className="text-2xl font-bold">Community Details</CardTitle>
                <CardDescription>This information will be visible to everyone on Discussly.</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Community Name</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">d/</span>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value.replace(/\s+/g, '').toLowerCase())}
                        placeholder="my-awesome-tribe"
                        className="pl-8 h-12 font-medium"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">Names cannot contain spaces and are lowercase (e.g. d/gaming-hub)</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Primary Category</Label>
                    <Select onValueChange={setCategory} value={category}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="art">Creative Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this tribe about?"
                      className="min-h-[120px] resize-none pt-3"
                    />
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/20 border-t p-6">
                  <Button type="submit" className="w-full h-12 font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Founding Tribe...</>
                    ) : (
                      <><Plus className="mr-2 h-4 w-4" /> Create Community</>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Preview Side */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Live Preview
            </div>
            
            <Card className="border-2 border-dashed border-border overflow-hidden bg-muted/5 transition-all duration-300">
              <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
              <CardContent className="relative pt-0 pb-6">
                <div className="absolute -top-8 left-6">
                  <div className="h-16 w-16 rounded-2xl bg-background border-2 border-primary/20 shadow-xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                
                <div className="pt-10 px-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-black truncate">
                      {name ? `d/${name}` : 'd/your-tribe'}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      {category ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none capitalize font-bold">
                          {category}
                        </Badge>
                      ) : (
                        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                      )}
                      <Badge variant="outline" className="text-muted-foreground">0 members</Badge>
                    </div>
                  </div>

                  <Separator className="bg-border/50" />

                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                    {description || "A community starts with a great description. Type yours in the form to see how it looks here..."}
                  </p>

                  <div className="pt-2">
                    <Button variant="outline" className="w-full pointer-events-none opacity-50 border-dashed">
                      Join Tribe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As the founder, you'll be the first moderator. You can later add more moderators and customize the tribe's rules in settings.
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default CreateCommunityPage;