import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Flame, Users, Sparkles, Trophy, Search, TrendingUp, Info } from "lucide-react"

import { useGetPostsQuery } from "@/app/api/postsApi"
import { useGetCommunitiesQuery } from "@/app/api/communitiesApi"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

import PostCard from "@/components/postCard/PostCard"
import CommunityCard from "@/components/communitycard/CommunityCard"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

const Explore = () => {
  const { data: posts = [], isLoading: loadingPosts } = useGetPostsQuery()
  const { data: communities = [], isLoading: loadingCommunities } = useGetCommunitiesQuery()

  return (
    <div className="container max-w-6xl py-8 lg:py-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 fill-primary/10" />
            <span className="text-sm font-semibold uppercase tracking-wider">Discovery</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Explore</h1>
          <p className="text-muted-foreground">Trending conversations and rising communities.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input 
            placeholder="Search Discussly..." 
            className="pl-10 h-11 bg-muted/40 border-border/50 focus-visible:ring-primary/20 focus-visible:bg-background transition-all" 
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed */}
        <main className="lg:col-span-8">
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none mb-6 gap-8">
              <TabsTrigger 
                value="trending" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-3 text-sm font-medium transition-all"
              >
                <TrendingUp className="h-4 w-4 mr-2" /> Trending
              </TabsTrigger>
              <TabsTrigger 
                value="newest" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-0 py-3 text-sm font-medium transition-all"
              >
                <Flame className="h-4 w-4 mr-2" /> Newest
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="trending" className="mt-0 focus-visible:outline-none">
                {loadingPosts ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4"
                  >
                    {posts.map((post) => (
                      <motion.div key={post._id} variants={itemVariants}>
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </main>

        {/* Sidebar Discovery */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="shadow-none border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-orange-500 fill-orange-500/10" />
                  Top Communities
                </CardTitle>
                <CardDescription className="text-xs">Based on weekly activity</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCommunities ? (
                [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
              ) : communities.length > 0 ? (
                <div className="space-y-1">
                  {communities.slice(0, 5).map((community, index) => (
                    <motion.div 
                      key={community._id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommunityCard community={community} variant="minimal" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No communities yet.</p>
                </div>
              )}
              
              <Separator className="my-4 opacity-50" />
              
              <Button variant="ghost" className="w-full text-xs font-semibold h-9 hover:bg-primary/5 hover:text-primary transition-colors">
                Browse All Communities
              </Button>
            </CardContent>
          </Card>

          {/* Contextual Info Card */}
          <Card className="bg-primary/[0.03] border-primary/10 shadow-none overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-bold">Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Join specific hubs to tailor your personal home feed and engage with experts in niche fields.
              </p>
            </CardContent>
            <div className="h-1 w-full bg-primary/10 mt-2">
              <motion.div 
                className="h-full bg-primary/40"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export default Explore