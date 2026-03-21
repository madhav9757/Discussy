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
import { useCreateCommunityMutation } from "../../app/api/communitiesApi";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export function CreateCommunityModal({ children }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const [createCommunity, { isLoading }] = useCreateCommunityMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.includes(' ')) {
      toast.error('Community name is required and cannot contain spaces');
      return;
    }

    try {
      await createCommunity({ 
        name, 
        description, 
        category 
      }).unwrap();
      
      toast.success(`c/${name} created successfully!`);
      setOpen(false);
      setName('');
      setDescription('');
      setCategory('');
    } catch (error) {
      toast.error(error.data?.message || "Failed to create community");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button className="rounded-full shadow-sm"><Users className="w-4 h-4 mr-2" /> New Community</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-3xl p-6 border-border/60 shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight">Create a Community</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Build a new place to discuss your favorite topics.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-foreground/90 font-medium">Community Name</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground font-semibold">
                c/
              </span>
              <Input 
                id="name" 
                placeholder="awesomethemes" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 rounded-xl border-border/60 bg-muted/20 h-11 transition-all focus-visible:ring-1 focus-visible:ring-primary lowercase"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-foreground/90 font-medium">Category (Optional)</Label>
            <Input 
              id="category" 
              placeholder="e.g. Technology, Art, Science" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border-border/60 bg-muted/20 h-11 transition-all focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-foreground/90 font-medium">Description</Label>
            <Textarea 
              id="description" 
              placeholder="What is this community about?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl border-border/60 bg-muted/20 p-3 transition-all focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
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
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
