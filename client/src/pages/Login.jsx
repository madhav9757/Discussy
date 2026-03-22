import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../features/auth/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLoginMutation } from "../app/api/userApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login({ usernameOrEmail, password }).unwrap();
      dispatch(setCredentials({ user: data.user || data, token: data.token }));
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(
        err.data?.message || "Invalid credentials. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* ── Brand mark ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-11 h-11 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-xl tracking-tight shadow-md select-none">
            D
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Sign in to continue to Discussly
            </p>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          {/* Subtle top accent */}
          <div className="h-0.5 bg-linear-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email / Username */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-foreground/80">
                  Email or Username
                </label>
                <div className="relative group">
                  <Mail
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors pointer-events-none"
                  />
                  <Input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="you@example.com"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className={cn(
                      "h-11 pl-9 pr-4 rounded-xl border-border/50 bg-muted/30",
                      "text-[13.5px] font-medium placeholder:text-muted-foreground/40",
                      "focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50",
                      "hover:border-border transition-all",
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-foreground/80">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[12px] font-semibold text-primary/70 hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors pointer-events-none"
                  />
                  <Input
                    type={showPass ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "h-11 pl-9 pr-11 rounded-xl border-border/50 bg-muted/30",
                      "text-[13.5px] font-medium placeholder:text-muted-foreground/40",
                      "focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50",
                      "hover:border-border transition-all",
                    )}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    {showPass ? (
                      <EyeOff size={15} strokeWidth={2} />
                    ) : (
                      <Eye size={15} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-bold text-[14px] gap-2 shadow-sm mt-1 transition-all"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <Separator className="flex-1 bg-border/40" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
                or
              </span>
              <Separator className="flex-1 bg-border/40" />
            </div>

            {/* Sign up CTA */}
            <div className="text-center">
              <p className="text-[13px] text-muted-foreground font-medium">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-bold hover:underline underline-offset-2 transition-colors"
                >
                  Sign up free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer note ── */}
        <p className="text-center text-[11px] text-muted-foreground/40 font-medium px-4">
          By continuing you agree to our{" "}
          <button className="hover:text-muted-foreground transition-colors underline underline-offset-2">
            Terms
          </button>{" "}
          and{" "}
          <button className="hover:text-muted-foreground transition-colors underline underline-offset-2">
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;
