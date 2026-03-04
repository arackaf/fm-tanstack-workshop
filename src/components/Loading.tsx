import { AnimatePresence, motion } from "framer-motion";

export function Loading() {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        role="status"
        aria-label="Loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent animation-duration-[1.8s]" />
      </motion.div>
    </AnimatePresence>
  );
}
