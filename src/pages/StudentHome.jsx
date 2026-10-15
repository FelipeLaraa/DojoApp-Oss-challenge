import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Home as HomeIcon, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import TodaySection from '@/components/home/TodaySection';
import FriendsFeed from '@/components/home/FriendsFeed';

// Home com dropdown de contexto no topo: "Seu dia" (default) ou
// "Feed dos amigos". Transição em fade entre as duas views.
const StudentHome = () => {
  const { user } = useAuth();
  const [view, setView] = useState('today');
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  const options = [
    { id: 'today', label: 'Seu dia', icon: HomeIcon },
    { id: 'friends', label: 'Feed dos amigos', icon: Users }
  ];
  const current = options.find((o) => o.id === view) || options[0];

  const choose = (id) => {
    setView(id);
    setOpen(false);
  };

  return (
    <div className="min-h-screen pb-24 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <NotificationBell userId={user?.id}>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xl font-extrabold tracking-tight hover:opacity-80"
            >
              <span>{current.label}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-2 min-w-[200px] rounded-xl bg-[#141414] border border-white/10 shadow-2xl overflow-hidden z-20"
                >
                  {options.map((o) => {
                    const Icon = o.icon;
                    const active = o.id === view;
                    return (
                      <button
                        key={o.id}
                        onClick={() => choose(o.id)}
                        className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-left transition-colors ${
                          active
                            ? 'bg-white/5 text-white'
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {o.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </NotificationBell>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-6"
          >
            {view === 'today' ? <TodaySection /> : <FriendsFeed />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default StudentHome;
