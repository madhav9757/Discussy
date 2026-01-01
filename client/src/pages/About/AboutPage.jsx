'use client';

import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Github, Code2, Rocket, Users2, 
  Layers, Zap, Heart, ExternalLink 
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const AboutPage = () => {
  const techStack = [
    { name: "React", category: "Frontend" },
    { name: "Redux Toolkit", category: "State" },
    { name: "Node.js", category: "Backend" },
    { name: "Express", category: "API" },
    { name: "MongoDB", category: "Database" },
    { name: "Appwrite", category: "Auth/Storage" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Framer Motion", category: "Animations" },
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-12"
      >
        {/* Hero Section */}
        <motion.div variants={fadeUp} className="text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/5">
            Version 1.0.0
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            About <span className="text-primary">Discussly</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The nexus for digital communities. A modern, open-source discussion platform engineered for speed and engagement.
          </p>
        </motion.div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp}>
            <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 transition-all hover:border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Users2 className="h-5 w-5" /> Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                We believe that the best ideas are born from collaboration. Discussly provides the infrastructure for niche communities to thrive without the noise of traditional social media.
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 transition-all hover:border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Rocket className="h-5 w-5" /> The Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                To bridge the gap between simple chat rooms and bloated forums. We focus on high-performance real-time interactions powered by a modern MERN architecture.
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tech Stack Interactive Section */}
        <motion.div variants={fadeUp}>
          <Card className="overflow-hidden border-none bg-muted/30">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" /> Technical Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <div key={tech.name} className="group relative">
                    <Badge variant="secondary" className="px-3 py-1.5 cursor-default hover:bg-primary hover:text-white transition-colors">
                      {tech.name}
                    </Badge>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500"/> Real-time Updates</div>
                <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-blue-500"/> RESTful API</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* GitHub Call to Action */}
        <motion.div variants={fadeUp}>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-primary to-purple-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/20">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Github className="h-6 w-6" /> Open for Contribution
              </h3>
              <p className="text-primary-foreground/80">
                Discussly is 100% open source. Help us build the future of discussion.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild className="rounded-full font-bold px-8 transition-transform hover:scale-105 active:scale-95">
              <a href="https://github.com/madhav9757/discussly" target="_blank" rel="noreferrer">
                Star on GitHub <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Footer Attribution */}
        <motion.div variants={fadeUp} className="text-center text-sm text-muted-foreground pt-10">
          <p className="flex items-center justify-center gap-1">
            Handcrafted with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by the Discussly Team
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutPage;