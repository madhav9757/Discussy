import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Loader2,
  User,
  Mail,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useUpdateProfileMutation } from "../app/api/userApi";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/features/auth/authSlice";

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
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
        isPrivate: user.isPrivate || false,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(formData).unwrap();
      // Update local auth state if it's the current user
      dispatch(setCredentials({ user: result }));
      toast.success("Profile updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err.data?.message || "Failed to update profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-linear-to-br from-primary/10 via-background to-background p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              Edit Profile
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1.5 ml-12">
              Update your presence on Discussly
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-background">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
              >
                Username
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Your unique handle"
                  className="pl-10 h-12 rounded-2xl border-border/60 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
              >
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="pl-10 h-12 rounded-2xl border-border/60 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
              >
                Bio
              </Label>
              <div className="relative group">
                <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                  <FileText size={18} />
                </div>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell the world about yourself..."
                  className="pl-10 min-h-[120px] rounded-2xl border-border/60 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all resize-none py-3"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isPrivate: !formData.isPrivate })
                }
                className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${formData.isPrivate ? "bg-primary/5 border-primary/30" : "bg-muted/20 border-border/40 hover:border-border/60"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${formData.isPrivate ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"}`}
                >
                  {formData.isPrivate ? (
                    <ShieldCheck size={20} />
                  ) : (
                    <ShieldAlert size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground/90 text-[15px]">
                    {formData.isPrivate ? "Private Account" : "Public Account"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {formData.isPrivate
                      ? "Only approved followers can see your profile."
                      : "Anyone on Discussly can see your posts and activity."}
                  </p>
                </div>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${formData.isPrivate ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full bg-background transition-all ${formData.isPrivate ? "right-1" : "left-1"}`}
                  />
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl font-bold hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
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
