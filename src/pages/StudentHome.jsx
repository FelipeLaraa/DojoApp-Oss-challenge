import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import TodaySection from '@/components/home/TodaySection';
import FriendsFeed from '@/components/home/FriendsFeed';

const StudentHome = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <NotificationBell userId={user?.id}>
          <h1 className="text-xl font-bold">Início</h1>
        </NotificationBell>

        <TodaySection />

        <FriendsFeed />
      </motion.div>
    </div>
  );
};

export default StudentHome;
