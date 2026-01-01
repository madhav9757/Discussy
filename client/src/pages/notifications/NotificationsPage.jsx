import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import {
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
  FileText,
  Info,
  CheckCheck,
  ExternalLink,
  Inbox,
} from "lucide-react"

import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/app/api/notificationsApi"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const iconMap = {
  comment: { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
  like: { icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
  follow: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  post: { icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
  system: { icon: Info, color: "text-slate-500", bg: "bg-slate-500/10" },
}

const NotificationsPage = () => {
  const { data: notifications = [], isLoading, error } = useGetNotificationsQuery()
  const [markAsRead] = useMarkNotificationAsReadMutation()
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsAsReadMutation()

  if (isLoading) return null // Consider adding a skeleton loader here later
  if (error) return null

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-10 px-4 md:px-0"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full px-2.5">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your alerts and interactions across the platform.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            disabled={markingAll}
            onClick={() => markAllRead()}
            className="w-full md:w-auto shadow-sm"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            notifications.map((n, index) => {
              const config = iconMap[n.type] || iconMap.system
              const Icon = config.icon

              return (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "group relative transition-all duration-200 border-none shadow-none hover:bg-accent/50",
                      !n.isRead ? "bg-accent/30" : "bg-transparent"
                    )}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      {/* Icon Avatar Style */}
                      <div className={cn(
                        "mt-1 p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110",
                        config.bg,
                        config.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className={cn(
                          "text-sm leading-relaxed",
                          !n.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {formatTimeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {n.link && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                asChild
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Link to={n.link}>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                          </Tooltip>
                        )}
                        
                        {!n.isRead && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="bg-muted/50 p-6 rounded-full mb-4">
                <Inbox className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No notifications yet</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                We'll let you know when something important happens.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function formatTimeAgo(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default NotificationsPage