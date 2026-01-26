import React from "react"
import { motion } from "framer-motion"
import { 
  Flame, Sparkles, Trophy, Search, TrendingUp, 
  Info, MoreHorizontal, Hash, ArrowUpRight, Filter,
  AlertCircle, LogIn
} from "lucide-react"

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Kbd } from "@/components/ui/kbd"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// API & Custom Components
import { useGetPostsQuery } from "@/app/api/postsApi"
import { useGetCommunitiesQuery } from "@/app/api/communitiesApi"
import PostCard from "@/components/postCard/PostCard"
import CommunityCard from "@/components/communitycard/CommunityCard"

const ExplorePage = () => {
  const { data: posts = [], isLoading: loadingPosts, error: postError } = useGetPostsQuery()
  const { data: communities = [], isLoading: loadingComms } = useGetCommunitiesQuery()

  // Handle 401 Unauthorized or other API errors
  const isAuthError = postError && 'status' in postError && postError.status === 401

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* --- Top Navigation --- */}
      <header className="border-b px-6 py-3 flex items-center justify-between bg-card/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="bg-primary p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
             </div>
             <h1 className="text-lg font-bold tracking-tight hidden sm:block">Discussly</h1>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Breadcrumb className="hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Explore</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="w-[350px] pl-10 h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all" 
              placeholder="Search conversations..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Kbd className="pointer-events-none select-none">⌘ K</Kbd>
            </div>
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
      </header>

      {/* --- Main Workspace Layout --- */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        
        {/* Left: Navigation Panel */}
        <ResizablePanel defaultSize={18} minSize={15} className="hidden md:block border-r bg-muted/5">
          <ScrollArea className="h-full p-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-2">Navigation</h2>
                <nav className="space-y-1">
                  <Button variant="secondary" className="w-full justify-start h-10 px-3"><TrendingUp className="h-4 w-4 mr-3 text-primary" /> Popular</Button>
                  <Button variant="ghost" className="w-full justify-start h-10 px-3 opacity-70"><Flame className="h-4 w-4 mr-3" /> All Content</Button>
                  <Button variant="ghost" className="w-full justify-start h-10 px-3 opacity-70"><Trophy className="h-4 w-4 mr-3" /> Leaderboard</Button>
                </nav>
              </div>
              <Separator />
              <Card className="bg-primary/5 border-primary/10 border-dashed">
                <CardHeader className="p-4">
                  <CardTitle className="text-xs">Create Community</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-[11px] text-muted-foreground mb-3">Found your own niche and invite others.</p>
                  <Button size="sm" className="w-full h-8 text-xs font-bold">Get Started</Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center: Content Feed */}
        <ResizablePanel defaultSize={57}>
          <div className="h-full flex flex-col">
            <Tabs defaultValue="trending" className="flex-1 flex flex-col">
              <div className="px-6 pt-4 border-b bg-background flex items-center justify-between">
                <TabsList className="bg-transparent h-12 gap-6 p-0">
                  <TabsTrigger value="trending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 h-full font-bold">Trending</TabsTrigger>
                  <TabsTrigger value="newest" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 h-full font-bold">Recent</TabsTrigger>
                </TabsList>
                <Badge variant="outline" className="h-6 font-mono font-normal">v.2.0.4</Badge>
              </div>

              <ScrollArea className="flex-1">
                <div className="max-w-2xl mx-auto p-6">
                  {isAuthError ? (
                    <Alert variant="destructive" className="mt-10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Authentication Required</AlertTitle>
                      <AlertDescription className="flex flex-col gap-3">
                        You must be logged in to view trending content.
                        <Button variant="outline" size="sm" className="w-fit border-destructive/50 text-destructive hover:bg-destructive/10">
                          <LogIn className="h-3 w-3 mr-2" /> Sign In
                        </Button>
                      </AlertDescription>
                    </Alert>
                  ) : loadingPosts ? (
                    <div className="space-y-6 mt-4">
                      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-60 w-full rounded-2xl" />)}
                    </div>
                  ) : (
                    <TabsContent value="trending" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </TabsContent>
                  )}
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right: Discovery & Info */}
        <ResizablePanel defaultSize={25} minSize={20} className="hidden xl:block">
          <ScrollArea className="h-full p-6 bg-muted/5">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rising Hubs</h3>
                  <Button variant="link" className="text-[11px] h-auto p-0">Explore All</Button>
                </div>
                {loadingComms ? (
                   [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                ) : (
                  <div className="space-y-2">
                    {communities.slice(0, 5).map((c) => (
                      <div key={c._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-card transition-colors border border-transparent hover:border-border">
                        <CommunityCard community={c} variant="minimal" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs font-medium">Follow Community</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-medium">View Stats</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Card className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent border-primary/5 shadow-none overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xs font-bold">Did you know?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Personalized feeds are calculated based on your hub engagement and "Rising" trends in your region.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ExplorePage