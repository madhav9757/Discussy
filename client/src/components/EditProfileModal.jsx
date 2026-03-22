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
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden border-border/30 shadow-2xl bg-card">
        <div className="bg-muted/10 p-5 pb-3">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2 text-foreground/90">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60 border border-primary/10">
                <User size={16} strokeWidth={2.5} />
              </div>
              Identity Update
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground/50 mt-1 font-bold uppercase tracking-widest">
              Modify your digital presence
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5">
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1"
              >
                Username
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/20 group-focus-within:text-primary/50 transition-colors">
                  <User size={14} />
                </div>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="The handle you go by"
                  className="pl-9 h-10 rounded-xl border-border/30 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1"
              >
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/20 group-focus-within:text-primary/50 transition-colors">
                  <Mail size={14} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="pl-9 h-10 rounded-xl border-border/30 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="bio"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1"
              >
                Biography
              </Label>
              <div className="relative group">
                <div className="absolute top-2.5 left-3 pointer-events-none text-muted-foreground/20 group-focus-within:text-primary/50 transition-colors">
                  <FileText size={14} />
                </div>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="What's your story?"
                  className="pl-9 min-h-[90px] rounded-xl border-border/30 bg-muted/20 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all resize-none py-2.5 font-medium text-sm"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isPrivate: !formData.isPrivate })
                }
                className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 text-left ${formData.isPrivate ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/20 hover:border-border/40"}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${formData.isPrivate ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground/40"}`}
                >
                  {formData.isPrivate ? (
                    <ShieldCheck size={16} />
                  ) : (
                    <ShieldAlert size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground/80 text-[13px] leading-tight">
                    {formData.isPrivate ? "Stealth Mode" : "Public Discovery"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">
                    {formData.isPrivate
                      ? "Only approved tribe members"
                      : "Open to the entire collective"}
                  </p>
                </div>
                <div
                  className={`w-8 h-4 rounded-full relative transition-colors overflow-hidden ${formData.isPrivate ? "bg-primary" : "bg-muted-foreground/20"}`}
                >
                  <div
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-background transition-all shadow-xs ${formData.isPrivate ? "right-0.5" : "left-0.5"}`}
                  />
                </div>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-row items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-widest border-border/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xs transition-transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Finalize"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
