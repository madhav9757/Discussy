import React, { useState, useEffect } from "react";
import { useUpdateCommunityMutation } from "@/app/api/communitiesApi";
import { toast } from "sonner";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// lucide icons
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EditCommunityModal = ({ isOpen, onClose, community }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    bannerImage: "",
  });

  const [updateCommunity, { isLoading }] = useUpdateCommunityMutation();

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name || "",
        description: community.description || "",
        category: community.category || "",
        image: community.image || "",
        bannerImage: community.bannerImage || "",
      });
    }
  }, [community]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCommunity({ id: community._id, ...formData }).unwrap();
      toast.success("Community updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to update community");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-background border-border/50">
        <DialogHeader className="px-6 py-5 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Edit Community
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Update your community's details and appearance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-xs font-medium text-foreground"
              >
                Community Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Community Name"
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-xs font-medium text-foreground"
              >
                Category
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Gaming, Tech, etc."
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
            </div>

            {/* Icon URL */}
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="text-xs font-medium text-foreground"
              >
                Icon URL
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/icon.png"
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
            </div>

            {/* Banner URL */}
            <div className="space-y-2">
              <Label
                htmlFor="bannerImage"
                className="text-xs font-medium text-foreground"
              >
                Banner URL
              </Label>
              <Input
                id="bannerImage"
                value={formData.bannerImage}
                onChange={(e) =>
                  setFormData({ ...formData, bannerImage: e.target.value })
                }
                placeholder="https://example.com/banner.png"
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-medium text-foreground"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What is this community about?"
                className="resize-none min-h-[100px] bg-muted/30 shadow-none border-border/50 focus-visible:ring-1 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/10 flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="shadow-none border-border/50 h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="shadow-none h-9 px-4 text-xs font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCommunityModal;
