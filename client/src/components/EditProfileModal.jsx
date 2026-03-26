import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useUpdateProfileMutation } from "../app/api/userApi";
import { setCredentials } from "@/features/auth/authSlice";
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
import { Loader2, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    image: "",
    bannerImage: "",
    isPrivate: false,
  });

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        image: user.image || "",
        bannerImage: user.bannerImage || "",
        isPrivate: user.isPrivate || false,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(formData).unwrap();
      dispatch(setCredentials({ user: result }));
      toast.success("Profile updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-background border-border/50">
        <DialogHeader className="px-6 py-5 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Update your personal information and privacy settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-medium text-foreground"
              >
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Username"
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium text-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="m@example.com"
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
            </div>

            {/* Profile Picture URL */}
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="text-xs font-medium text-foreground"
              >
                Profile Picture URL
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://example.com/pfp.png"
                className="h-10 bg-muted/30 shadow-none border-border/50 focus-visible:ring-1"
              />
              <p className="text-[10px] text-muted-foreground">
                Leave blank to use default DiceBear avatar.
              </p>
            </div>

            {/* Banner Image URL */}
            <div className="space-y-2">
              <Label
                htmlFor="bannerImage"
                className="text-xs font-medium text-foreground"
              >
                Banner Image URL
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
              <p className="text-[10px] text-muted-foreground">
                External URL for your profile background.
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-xs font-medium text-foreground"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us a little bit about yourself"
                className="resize-none min-h-[80px] bg-muted/30 shadow-none border-border/50 focus-visible:ring-1 text-sm"
              />
            </div>

            {/* Privacy Setting (Settings Row Style) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isPrivate: !formData.isPrivate })
                }
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg border transition-colors text-left",
                  formData.isPrivate
                    ? "bg-primary/5 border-primary/20"
                    : "bg-background border-border/50 hover:bg-muted/30",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-md",
                      formData.isPrivate
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {formData.isPrivate ? (
                      <Lock size={16} />
                    ) : (
                      <Globe size={16} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      Private Account
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formData.isPrivate
                        ? "Only approved members can see your profile."
                        : "Your profile is visible to everyone."}
                    </p>
                  </div>
                </div>

                {/* Minimal Custom Toggle (if shadcn Switch isn't used) */}
                <div
                  className={cn(
                    "w-9 h-5 rounded-full relative transition-colors shrink-0 flex items-center px-0.5",
                    formData.isPrivate
                      ? "bg-primary"
                      : "bg-muted-foreground/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full bg-background transition-transform shadow-sm",
                      formData.isPrivate ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                </div>
              </button>
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

export default EditProfileModal;
