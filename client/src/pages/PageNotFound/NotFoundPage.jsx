import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ghost, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded bg-muted mx-auto">
          <Ghost className="h-8 w-8 text-muted-foreground/40" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            The page has vanished
          </p>
        </div>

        <div className="pt-4">
          <Button
            asChild
            variant="outline"
            className="h-10 px-6 font-bold uppercase tracking-tight text-xs border-2"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Go back home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
