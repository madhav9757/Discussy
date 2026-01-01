import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

const Loader = ({ fullPage = false, className }) => {
  if (fullPage) {
    return (
      <div className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md",
        className
      )}>
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-24 w-24 rounded-full bg-primary/20"
          />
          
          {/* Spinning Border */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="h-16 w-16 rounded-full border-t-2 border-r-2 border-primary border-transparent"
          />

          {/* Logo Center */}
          <div className="absolute bg-primary p-2 rounded-xl shadow-lg">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-col items-center gap-1"
        >
          <p className="text-sm font-bold tracking-widest uppercase text-foreground/70">
            Discussly
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Standard Component-level Loader
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 w-full", className)}>
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
        className="h-8 w-8 rounded-full border-2 border-muted border-t-primary"
      />
      <p className="mt-3 text-xs font-medium text-muted-foreground animate-pulse">
        Updating content...
      </p>
    </div>
  );
};

export default Loader;