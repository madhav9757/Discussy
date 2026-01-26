'use client';

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Github, Code2, Rocket, Users2, 
  Layers, Zap, Heart, ExternalLink,
  ShieldCheck, Globe2, Sparkles
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const AboutPage = () => {
  const techStack = [
    { name: "React", category: "Library", icon: "⚛️" },
    { name: "Redux Toolkit", category: "State", icon: "🟣" },
    { name: "Node.js", category: "Runtime", icon: "🟢" },
    { name: "MongoDB", category: "Database", icon: "🍃" },
    { name: "Appwrite", category: "Backend/Auth", icon: "🅰️" },
    { name: "Tailwind CSS", category: "Styling", icon: "🌊" },
    { name: "Framer Motion", category: "Animations", icon: "🎬" },
    { name: "Shadcn UI", category: "Components", icon: "🎨" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-24 px-6 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-20 relative z-10"
      >
        {/* Hero Section */}
        <motion.div variants={fadeUp} className="text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5 rounded-full uppercase tracking-widest text-[10px] font-black">
            Infrastructure v1.0.0
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase">
            About <span className="text-primary tracking-normal not-italic">Discussly</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Discussly is more than a forum; it's a high-performance nexus engineered for digital tribes to converge, create, and coexist.
          </p>
        </motion.div>

        {/* Stats / Impact Section */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Architecture", value: "MERN+", icon: Layers },
            { label: "Interaction", value: "Real-time", icon: Zap },
            { label: "Security", value: "Appwrite", icon: ShieldCheck },
            { label: "License", value: "MIT", icon: Globe2 },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 text-center space-y-2 group hover:bg-white/[0.05] transition-colors">
              <stat.icon className="h-5 w-5 mx-auto text-primary/50 group-hover:text-primary transition-colors" />
              <div className="text-2xl font-black italic uppercase tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={fadeUp}>
            <Card className="h-full bg-white/[0.02] border-white/5 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-primary uppercase italic font-black text-xl">
                  <Users2 className="h-6 w-6" /> The Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400 text-sm leading-relaxed font-medium">
                In an era of algorithm-driven noise, we provide the silence and structure necessary for deep discussion. We build for the architects of niche communities who demand better tooling and faster feedback loops.
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="h-full bg-white/[0.02] border-white/5 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-primary uppercase italic font-black text-xl">
                  <Rocket className="h-6 w-6" /> The Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400 text-sm leading-relaxed font-medium">
                To democratize community ownership. By combining a robust Node.js backend with a fluid React frontend, Discussly offers the speed of a modern chat app with the permanence of a traditional forum.
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tech Stack Interactive Section */}
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em]">Technical Engine</h2>
          </div>
          <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
            <TooltipProvider delayDuration={0}>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech) => (
                  <Tooltip key={tech.name}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="px-5 py-2.5 rounded-full bg-white/5 border-white/5 text-sm font-bold cursor-default hover:bg-primary hover:text-black transition-all"
                      >
                        <span className="mr-2 opacity-70">{tech.icon}</span> {tech.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-white rounded-xl px-4 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest">{tech.category}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            
            <Separator className="my-8 bg-white/5" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" /> Real-time Hydration
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="h-4 w-4 text-blue-500" /> Glassmorphism UI
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-green-500" /> End-to-End Auth
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={fadeUp}>
          <div className="relative p-1 rounded-[3rem] bg-gradient-to-r from-primary/50 via-purple-500/50 to-primary/50 group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-[#09090b] rounded-[2.8rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter">
                  Open Engine. <br /><span className="text-primary">Global Tribe.</span>
                </h3>
                <p className="text-zinc-400 max-w-sm font-medium">
                  Discussly is 100% open source. Join us on GitHub to audit the code or contribute to the core.
                </p>
              </div>
              <Button size="lg" asChild className="h-16 px-10 rounded-full font-black text-lg uppercase tracking-tight shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <a href="https://github.com/madhav9757/discussly" target="_blank" rel="noreferrer">
                  <Github className="mr-3 h-6 w-6" /> Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={fadeUp} className="text-center pb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 flex items-center justify-center gap-3">
            Handcrafted with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> for the open web
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutPage;