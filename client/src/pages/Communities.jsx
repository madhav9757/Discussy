import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetCommunitiesQuery } from "../app/api/communitiesApi";
import { Users, Hash, UsersIcon, ArrowRight, Tag } from "lucide-react";
import { Button } from "../components/ui/button";
import { CreateCommunityModal } from "../components/modals/CreateCommunityModal";

const Communities = () => {
  const { data: communities, isLoading } = useGetCommunitiesQuery();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UsersIcon size={24} className="text-primary" />
          Communities
        </h1>
        <CreateCommunityModal>
          <Button className="h-10 text-sm px-5 rounded-full font-medium shadow-sm">
            Create Community
          </Button>
        </CreateCommunityModal>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-[160px] rounded-2xl bg-muted/40 animate-pulse border border-border/50"
            />
          ))}
        </div>
      ) : communities?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {communities.map((community) => (
            <div
              key={community._id}
              onClick={() => navigate(`/communities/${community._id}`)}
              className="group border border-border/60 bg-card hover:border-primary/30 hover:shadow-md rounded-2xl p-5 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-muted border border-border/40 rounded-2xl overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${community.name}&backgroundColor=transparent`}
                    alt={community.name}
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black truncate text-foreground/95 group-hover:text-primary transition-colors">
                    c/{community.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Users size={12} className="text-muted-foreground/60" />
                      {community.members?.length || 0} members
                    </span>
                    {community.category && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full border border-primary/10">
                        <Tag size={9} /> {community.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed flex-1">
                {community.description || "Welcome! Join the discussion and connect with others."}
              </p>

              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-xs text-muted-foreground/50 font-medium">
                  View community
                </span>
                <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border/60 bg-card rounded-3xl min-h-[300px] flex items-center justify-center shadow-sm">
          <div className="text-center text-muted-foreground/70 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <Hash className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <div>
              <p className="font-bold text-lg">No communities yet</p>
              <p className="text-sm mt-1">Be the first to create one!</p>
            </div>
            <CreateCommunityModal>
              <Button size="sm" className="rounded-full px-6">Create Community</Button>
            </CreateCommunityModal>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;
