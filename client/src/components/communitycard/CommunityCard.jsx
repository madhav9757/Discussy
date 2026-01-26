import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hash, ArrowRight, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CommunityCard = ({ community, variant = "default" }) => {
  const navigate = useNavigate();

  const communityName = community.name || 'Unknown';
  const description = community.description || 'No description available.';
  const memberCount = community.members?.length || 0;
  const communityId = community._id || '#';

  const handleClick = (e) => {
    // Prevent navigation if clicking the follow button
    if (e.target.closest('button')) return;
    navigate(`/community/${communityId}`);
  };

  // --- Minimal Variant (Designed for Sidebars/Explore Sidebars) ---
  if (variant === "minimal") {
    return (
      <div 
        onClick={handleClick}
        className="group flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/60"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/40">
            <AvatarImage src={community.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {communityName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate group-hover:text-primary transition-colors">
              d/{communityName}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <Users className="h-3 w-3" /> {memberCount.toLocaleString()} members
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // --- Default Variant (Designed for Discovery Grids) ---
  return (
    <Card 
      onClick={handleClick}
      className="group relative cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300"
    >
      <CardHeader className="p-5 pb-0">
        <div className="flex items-start justify-between">
          <Avatar className="h-14 w-14 rounded-2xl border-2 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
            <AvatarImage src={community.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold">
              {communityName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="px-2 py-1 font-mono text-[10px] uppercase tracking-tighter">
                  Active
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Community is highly active</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
            d/{communityName}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-40" />
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 min-h-[40px]">
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold">{memberCount.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Members</span>
          </div>
          <div className="h-8 w-[1px] bg-border/60" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-green-500">2.4k</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Online</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-transparent group-hover:border-border/30 transition-colors">
        <Button className="w-full mt-2 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-none hover:shadow-lg hover:shadow-primary/20" variant="secondary">
          Join Hub
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;