import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const Friends = () => {
  return (
    <div className="min-h-screen pb-20 p-6 dojo-gradient flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Amigos</h1>
        <p className="text-gray-400">Em breve: conecte-se com outros atletas do dojo.</p>
      </motion.div>
    </div>
  );
};

export default Friends;
