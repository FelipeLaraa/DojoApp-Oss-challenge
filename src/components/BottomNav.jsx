import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Calendar, Flame, Trophy, User, Users } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const { userType } = useAuth();

  // Don't show nav on login page
  if (location.pathname === '/') return null;

  const getHomeRoute = () => {
    switch (userType) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'academy': return '/academy';
      default: return '/';
    }
  };

  const navItems = [
    { path: getHomeRoute(), icon: Home, label: 'Home' },
    { path: '/schedule', icon: Calendar, label: 'Agenda' },
    { path: '/register', icon: Flame, label: 'Treinar' },
    { path: '/ranking', icon: Trophy, label: 'Ranking' },
    { path: '/friends', icon: Users, label: 'Amigos' },
    { path: '/profile', icon: User, label: 'Perfil' }
  ];

  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="nav-pill"
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                />
              )}
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
