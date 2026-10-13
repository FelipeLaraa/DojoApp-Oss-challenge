import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Calendar, QrCode, Trophy, User, Users } from 'lucide-react';

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
    { path: '/checkin', icon: QrCode, label: 'Check-in' },
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
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;