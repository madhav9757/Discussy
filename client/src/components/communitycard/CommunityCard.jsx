import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hash, ArrowRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CommunityCard = ({ community, variant = "default" }) => {
  const navigate = useNavigate();

  const communityName = community.name || 'Unknown';
  const descriptionSnippet = community.description
    ? community.description.slice(0, variant === "minimal" ? 40 : 100) + 
      (community.description.length > (variant === "minimal" ? 40 : 100) ? '...' : '')
    : 'No description available.';
  const memberCount = community.members?.length || 0;
  const communityId = community._id || '#';

  const handleClick = () => {
    navigate(`/community/${communityId}`);
  };

  // Minimal Variant (for Sidebars/Lists)
  if (variant === "minimal") {
    return (
      <div 
        onClick={handleClick}
        className="group flex items-center justify-between p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all border border-transparent hover:border-primary/10"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
            {communityName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold group-hover:text-primary transition-colors">
              r/{communityName}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> {memberCount} members
            </span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
      </div>
    );
  }

  // Default Variant (for Grids/Explore Page)
  return (
    <Card 
      onClick={handleClick}
      className="group cursor-pointer border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <Hash size={24} />
          </div>
          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            {memberCount} members
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
            r/{communityName}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {descriptionSnippet}
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 transition-transform">
          View Community <ArrowRight size={14} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunityCard;