import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/1234567890?text=Hello! I'm interested in your jewelry collection."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute -top-2 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
        1
      </span>
    </motion.a>
  );
}
