// ./pages/NotFoundPage.jsx
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-[70vh] flex items-center justify-center px-4"
    >
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center gap-4 py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">404</h1>
            <p className="text-muted-foreground">
              The page you’re looking for doesn’t exist.
            </p>
          </div>

          <Separator className="my-2" />

          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4 text-primary/80" />
              Go back home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default NotFoundPage
