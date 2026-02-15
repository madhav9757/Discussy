// client/src/pages/About/AboutPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Code2,
  Rocket,
  Users2,
  Layers,
  Zap,
  Heart,
  ShieldCheck,
  Globe2,
} from "lucide-react";

const AboutPage = () => {
  const techStack = [
    { name: "React", category: "Frontend" },
    { name: "Redux Toolkit", category: "State" },
    { name: "Node.js", category: "Backend" },
    { name: "MongoDB", category: "Database" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Shadcn UI", category: "Components" },
  ];

  return (
    <div className="min-h-screen bg-background py-32 px-4">
      <div className="max-w-4xl mx-auto space-y-24">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Discussly</h1>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
            A minimal, high-performance platform for community discussions and
            knowledge sharing.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y py-12">
          {[
            { label: "Architecture", value: "MERN", icon: Layers },
            { label: "Interaction", value: "Real-time", icon: Zap },
            { label: "Security", value: "Standard", icon: ShieldCheck },
            { label: "License", value: "MIT", icon: Globe2 },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <stat.icon className="h-4 w-4 mx-auto text-muted-foreground opacity-50" />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Users2 className="h-4 w-4" /> The Vision
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              We provide the structure necessary for deep discussion without
              algorithm-driven noise. Our focus is on performance and content
              clarity.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Rocket className="h-4 w-4" /> The Mission
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              To democratize community ownership. By combining a robust backend
              with a fluid frontend, Discussly offers the speed of a modern app
              with the permanence of a traditional forum.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
            <Code2 className="h-4 w-4" /> Technical Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech) => (
              <Badge
                key={tech.name}
                variant="outline"
                className="px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight border-2"
              >
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="p-12 text-center space-y-8 border-2 border-border/50 rounded-lg">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Open Source</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">
              Discussly is 100% open source. Join us on GitHub to audit the code
              or contribute to the core.
            </p>
          </div>
          <Button
            size="lg"
            asChild
            className="h-12 px-8 font-bold uppercase tracking-tight text-xs"
          >
            <a
              href="https://github.com/madhav9757/discussly"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="mr-3 h-4 w-4" /> View on GitHub
            </a>
          </Button>
        </div>

        <footer className="text-center pb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40 flex items-center justify-center gap-2">
            Crafted with heart for the open web
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
