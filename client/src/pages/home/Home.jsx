import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Flame,
  Users,
  PenTool,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Plus,
  LayoutGrid
} from "lucide-react"

import { useGetPostsQuery } from "@/app/api/postsApi"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import PostCard from "@/components/postCard/PostCard"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  },
}

const Home = () => {
  const { data: latestPosts = [], isLoading } = useGetPostsQuery({})

  return (
    <div className="relative min-h-screen bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-6xl py-12 lg:py-20 space-y-24"
      >
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-6 pt-8">
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="px-3 py-1 gap-2 rounded-full bg-primary/5 text-primary border-primary/20 transition-colors hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 fill-primary/20" />
              <span className="text-xs font-medium tracking-tight">Public Beta Now Live</span>
            </Badge>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Where communities <br />
              <span className="text-primary">come to life.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-normal">
              An open-source platform for meaningful conversations. Share ideas, 
              ask questions, and connect with people globally.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 pt-4">
            <Button size="lg" asChild className="rounded-md px-8 shadow-sm">
              <Link to="/new-post">
                <Plus className="mr-2 h-4 w-4" />
                Start Discussion
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-md px-8">
              <Link to="/community">
                <LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground" />
                Explore Hubs
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Core Actions */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { 
              to: "/explore", 
              icon: Flame, 
              color: "text-orange-500", 
              bg: "bg-orange-50", 
              title: "Trending Feed", 
              desc: "Top discussions shaping the current narrative." 
            },
            { 
              to: "/new-post", 
              icon: PenTool, 
              color: "text-blue-500", 
              bg: "bg-blue-50", 
              title: "Share Insight", 
              desc: "Contribute your knowledge to the community." 
            },
            { 
              to: "/community", 
              icon: Users, 
              color: "text-indigo-500", 
              bg: "bg-indigo-50", 
              title: "Active Hubs", 
              desc: "Groups for developers, artists, and enthusiasts." 
            }
          ].map((item, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Link to={item.to} className="block group h-full">
                <Card className="h-full transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-md">
                  <CardHeader className="space-y-4">
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <item.icon className={`h-5 w-5 ${item.color} fill-current/10`} />
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Feed Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/5">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Recent Discussions</h2>
            </div>

            {!isLoading && latestPosts.length > 0 && (
              <Button variant="ghost" size="sm" asChild className="group">
                <Link to="/explore">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestPosts.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {latestPosts.slice(0, 6).map((post) => (
                <motion.div key={post._id} variants={itemVariants}>
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 rounded-full bg-background border shadow-sm">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-lg">No discussions yet</p>
                  <p className="text-muted-foreground max-w-xs">
                    Be the first to share a thought or ask a question.
                  </p>
                </div>
                <Button variant="outline" asChild className="mt-2">
                  <Link to="/new-post">Create Post</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </motion.div>
    </div>
  )
}

export default Home