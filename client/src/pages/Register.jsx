import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRegisterMutation } from "../app/api/userApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
} from "lucide-react";

/* ── Cycling images ── */
const PANEL_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
    quote: "Great communities are built one voice at a time.",
  },
  {
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&q=80",
    quote: "Every expert was once a beginner who dared to ask.",
  },
  {
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
    quote: "Find your people. Share your ideas. Grow together.",
  },
];

/* ── Password strength ── */
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-500" },
  ];
  return { score, ...map[score] };
};

const PERKS = [
  "Join & create communities",
  "Upvote and discuss posts",
  "Follow interesting people",
  "Completely free, always",
];

/* ════════════════════════════════════════════════════ */
const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const id = setInterval(
      () => setImgIndex((i) => (i + 1) % PANEL_IMAGES.length),
      6000,
    );
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(formData).unwrap();
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  const strength = getStrength(formData.password);
  const current = PANEL_IMAGES[imgIndex];

  return (
    <>
      <style>{`
        @keyframes kenburns {
          0%   { transform: scale(1)    translateX(0%)    translateY(0%);  }
          50%  { transform: scale(1.08) translateX(-1.5%) translateY(-1%); }
          100% { transform: scale(1)    translateX(0%)    translateY(0%);  }
        }
        @keyframes panelFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .kb-img     { animation: kenburns 14s ease-in-out infinite; }
        .panel-fade { animation: panelFade 1s ease both; }
        .fi-1 { animation: fadeIn .45s .05s ease both; }
        .fi-2 { animation: fadeIn .45s .12s ease both; }
        .fi-3 { animation: fadeIn .45s .19s ease both; }
        .fi-4 { animation: fadeIn .45s .26s ease both; }
        .fi-5 { animation: fadeIn .45s .33s ease both; }
        .fi-6 { animation: fadeIn .45s .40s ease both; }
      `}</style>

      <div className="min-h-screen flex overflow-hidden bg-background">
        {/* ══════════ LEFT — image panel ══════════ */}
        <div className="hidden lg:block lg:w-[52%] relative overflow-hidden shrink-0">
          {/* Ken-Burns photo */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              key={imgIndex}
              src={current.url}
              alt="Community"
              className="kb-img panel-fade w-full h-full object-cover"
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/15" />

          {/* Logo */}
          <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg shadow-lg select-none">
              D
            </div>
            <span className="font-black text-lg text-white tracking-tight drop-shadow">
              Discussly
            </span>
          </div>

          {/* Perks — centered vertically */}
          <div className="absolute top-1/2 -translate-y-1/2 left-10 right-10 z-10 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-5">
              What you get
            </p>
            {PERKS.map((perk, i) => (
              <div
                key={perk}
                className="flex items-center gap-3"
                style={{
                  animation: `panelFade 0.6s ${0.1 * i + 0.3}s ease both`,
                  opacity: 0,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} className="text-white" />
                </div>
                <span className="text-[14.5px] font-semibold text-white/85">
                  {perk}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom quote + dots */}
          <div className="absolute bottom-10 left-8 right-8 z-10">
            <blockquote key={imgIndex} className="panel-fade">
              <p className="text-[22px] font-black leading-snug text-white tracking-tight drop-shadow-lg">
                "{current.quote}"
              </p>
              <footer className="mt-3 text-[13px] font-semibold text-white/50">
                — Discussly Community
              </footer>
            </blockquote>
            <div className="flex items-center gap-2 mt-5">
              {PANEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={cn(
                    "rounded-full transition-all duration-500",
                    i === imgIndex
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/35 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT — form panel ══════════ */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
          <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/6 blur-[80px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-400/5 blur-[60px]" />

          <div className="w-full max-w-[380px] relative">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden fi-1">
              <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center font-black text-lg shadow-md select-none">
                D
              </div>
              <span className="font-black text-lg text-foreground tracking-tight">
                Discussly
              </span>
            </div>

            {/* Heading */}
            <div className="mb-7 fi-1">
              <h1 className="text-[28px] font-black tracking-tight text-foreground">
                Create an account
              </h1>
              <p className="text-[13.5px] text-muted-foreground mt-1.5 font-medium">
                Already a member?{" "}
                <Link
                  to="/login"
                  className="text-primary font-bold hover:underline underline-offset-2"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3 mb-5 fi-2">
              {[
                {
                  name: "Google",
                  logo: (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  ),
                },
                {
                  name: "GitHub",
                  logo: (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 fill-foreground"
                    >
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  ),
                },
              ].map(({ name, logo }) => (
                <button
                  key={name}
                  type="button"
                  className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-border transition-all text-[13px] font-semibold text-foreground/80 hover:text-foreground"
                >
                  {logo}
                  {name}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5 fi-3">
              <Separator className="flex-1 bg-border/40" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                or
              </span>
              <Separator className="flex-1 bg-border/40" />
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5 fi-3">
                <label className="text-[12.5px] font-semibold text-foreground/70">
                  Username
                </label>
                <div className="relative group">
                  <User
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none"
                  />
                  <Input
                    type="text"
                    name="username"
                    required
                    autoComplete="username"
                    placeholder="e.g. john_doe"
                    value={formData.username}
                    onChange={handleChange}
                    className={cn(
                      "h-11 pl-9 pr-4 rounded-xl border-border/60 bg-muted/20 lowercase",
                      "text-[13.5px] font-medium placeholder:text-muted-foreground/35",
                      "focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50",
                      "hover:border-border transition-all",
                    )}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 fi-4">
                <label className="text-[12.5px] font-semibold text-foreground/70">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none"
                  />
                  <Input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={cn(
                      "h-11 pl-9 pr-4 rounded-xl border-border/60 bg-muted/20",
                      "text-[13.5px] font-medium placeholder:text-muted-foreground/35",
                      "focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50",
                      "hover:border-border transition-all",
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 fi-5">
                <label className="text-[12.5px] font-semibold text-foreground/70">
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors pointer-events-none"
                  />
                  <Input
                    type={showPass ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={cn(
                      "h-11 pl-9 pr-11 rounded-xl border-border/60 bg-muted/20",
                      "text-[13.5px] font-medium placeholder:text-muted-foreground/35",
                      "focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/50",
                      "hover:border-border transition-all",
                    )}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    {showPass ? (
                      <EyeOff size={15} strokeWidth={2} />
                    ) : (
                      <Eye size={15} strokeWidth={2} />
                    )}
                  </button>
                </div>

                {/* Strength meter */}
                {formData.password && (
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            strength.score >= s
                              ? strength.color
                              : "bg-muted/60",
                          )}
                        />
                      ))}
                    </div>
                    <p
                      className={cn(
                        "text-[11px] font-semibold",
                        strength.score <= 1
                          ? "text-red-500"
                          : strength.score === 2
                            ? "text-orange-400"
                            : strength.score === 3
                              ? "text-yellow-500"
                              : "text-green-500",
                      )}
                    >
                      {strength.label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-1 fi-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-bold text-[14px] gap-2 shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 transition-all"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <p className="text-center text-[11px] text-muted-foreground/40 font-medium mt-7 fi-6">
              By creating an account you agree to our{" "}
              <button className="hover:text-muted-foreground transition-colors underline underline-offset-2">
                Terms
              </button>{" "}
              &{" "}
              <button className="hover:text-muted-foreground transition-colors underline underline-offset-2">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
