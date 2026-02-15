import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const CommunityCard = ({ community, variant = "default" }) => {
  const navigate = useNavigate();

  const communityName = community.name || "Unknown";
  const description = community.description || "No description available.";
  const memberCount = community.members?.length || 0;
  const communityId = community._id || "#";

  const handleClick = (e) => {
    if (e.target.closest("button")) return;
    navigate(`/community/${communityId}`);
  };

  if (variant === "minimal") {
    return (
      <div
        onClick={handleClick}
        className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border border-transparent"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-md border">
            <AvatarImage src={community.avatar} />
            <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold uppercase">
              {communityName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate">
              d/{communityName}
            </span>
            <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold uppercase tracking-tight">
              <Users className="h-2.5 w-2.5" /> {memberCount}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      onClick={handleClick}
      className="group shadow-none border border-border/50 hover:border-foreground/20 transition-all rounded-md overflow-hidden bg-card"
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <Avatar className="h-12 w-12 rounded-lg border shadow-sm group-hover:scale-105 transition-transform">
            <AvatarImage src={community.avatar} />
            <AvatarFallback className="bg-muted text-muted-foreground text-lg font-bold">
              {communityName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Badge
            variant="secondary"
            className="px-2 py-0 text-[9px] font-bold uppercase tracking-widest bg-muted/50 text-muted-foreground border-transparent"
          >
            {community.category || "General"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 space-y-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold leading-tight truncate">
            d/{communityName}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold">
            {memberCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tight">
            Members
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full font-bold uppercase tracking-tighter text-[10px] h-9"
          variant="outline"
        >
          View Community
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityCard;
