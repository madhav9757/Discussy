import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from "react-hook-form";
import { 
  ArrowRight, ArrowLeft, Sparkles, Shield, 
  Globe, Lock, CheckCircle2, Rocket, Layout, 
  Settings2, Eye
} from 'lucide-react';
import { toast } from 'sonner';

import { useCreateCommunityMutation } from '../../../app/api/communitiesApi';

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [createCommunity, { isLoading, isSuccess }] = useCreateCommunityMutation();

  const form = useForm({
    defaultValues: { name: "", description: "", category: "", isPrivate: false },
  });

  const watchValues = form.watch();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Tribe established.');
      navigate('/community');
    }
  }, [isSuccess, navigate]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (values) => {
    try {
      await createCommunity(values).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'Creation failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden flex flex-col">
      {/* Ultra-Minimal Top Nav */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Rocket className="h-4 w-4 text-black" />
          </div>
          <span className="text-xs font-black tracking-[0.3em] uppercase opacity-70">Tribe Architect</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white">
          Exit Wizard
        </Button>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Interactive Form Side */}
        <div className="w-full lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center border-r border-white/5 relative">
          <div className="max-w-md mx-auto w-full space-y-8">
            
            {/* Step Indicators */}
            <div className="flex gap-2 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary' : 'bg-white/10'}`} />
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">The Identity</h2>
                        <p className="text-muted-foreground text-sm">Every great movement starts with a name.</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-primary tracking-widest">Tribe Handle</FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 font-black">d/</span>
                                <Input 
                                  {...field} 
                                  className="pl-10 h-16 bg-white/5 border-white/10 text-xl font-bold focus:border-primary/50 transition-all"
                                  placeholder="vibe-check"
                                  onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" onClick={nextStep} className="w-full h-14 rounded-xl font-black uppercase group">
                        Next Phase <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">The Vision</h2>
                        <p className="text-muted-foreground text-sm">Define the category and community manifesto.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase text-primary">Interest</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-14 bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                  {['Gaming', 'Tech', 'Art', 'Music'].map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="isPrivate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col justify-end">
                              <FormLabel className="text-[10px] font-black uppercase text-primary mb-3">Privacy</FormLabel>
                              <div className="h-14 flex items-center justify-between px-4 bg-white/5 border border-white/10 rounded-md">
                                <span className="text-xs font-bold">{field.value ? 'Lock' : 'Open'}</span>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase text-primary">Manifesto</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="min-h-[120px] bg-white/5 border-white/10 resize-none" placeholder="What are we building?" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={prevStep} className="h-14 w-20 border-white/10"><ArrowLeft /></Button>
                        <Button type="button" onClick={nextStep} className="h-14 flex-1 rounded-xl font-black uppercase">Almost There</Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="text-primary h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black tracking-tighter uppercase italic">Ready for Launch</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                            By clicking below, you establish <b>d/{watchValues.name}</b>. You will be granted Founder status and full moderation control.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={prevStep} className="h-14 w-20 border-white/10"><ArrowLeft /></Button>
                        <Button type="submit" disabled={isLoading} className="h-14 flex-1 rounded-xl font-black uppercase shadow-2xl shadow-primary/40">
                          {isLoading ? "Broadcasting..." : "Establish Tribe"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </Form>
          </div>
        </div>

        {/* Right: Immersive Live Preview Side */}
        <div className="hidden lg:flex w-1/2 bg-[#0c0c0e] items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-blue-500/5 blur-[120px] rounded-full" />

          <div className="w-full max-w-sm space-y-6 relative z-10">
            <div className="flex items-center gap-2 opacity-40">
              <Eye className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Feed Projection</span>
            </div>

            <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] rounded-[2.5rem]">
              <AspectRatio ratio={16 / 7}>
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-black flex items-center justify-end px-8">
                  {watchValues.isPrivate ? <Lock className="text-white/20 h-8 w-8" /> : <Globe className="text-white/20 h-8 w-8" />}
                </div>
              </AspectRatio>
              <CardContent className="pt-0 px-8 pb-10 relative">
                <Avatar className="h-24 w-24 rounded-3xl border-[6px] border-[#0c0c0e] shadow-2xl absolute -top-12 left-8">
                  <AvatarFallback className="bg-primary text-black text-3xl font-black italic">
                    {watchValues.name ? watchValues.name[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="pt-16 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter italic">d/{watchValues.name || "your-tribe"}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-white/10 bg-white/5">
                        {watchValues.category || "Uncategorized"}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-widest border-white/10 bg-white/5">1 Member</Badge>
                    </div>
                  </div>
                  <Separator className="bg-white/5" />
                  <p className="text-sm text-white/50 leading-relaxed line-clamp-3 italic">
                    "{watchValues.description || "The community manifesto will appear here. Define your vibe..."}"
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 opacity-30">
              <div className="h-24 rounded-3xl bg-white/5 border border-white/10" />
              <div className="h-24 rounded-3xl bg-white/5 border border-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunityPage;