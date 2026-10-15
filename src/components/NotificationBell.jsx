import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from '@/components/NotificationPanel';

// Bell + unread badge + panel, as a single unit the Home can drop in.
//
// Renders a top row (children on the left, bell button on the right) followed
// by the panel when open. Any extra content you want in that top row (title,
// filters) goes as children.
//
// Reads notifications from localStorage on each render (same behavior as
// before). A tiny force-render counter refreshes the list after the panel
// writes back.
const NotificationBell = ({ userId, children }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [, force] = useState(0);

  const seenKey = `dojoNotifSeen_${userId}`;
  const [lastSeen, setLastSeen] = useState(() => {
    try {
      return Number(localStorage.getItem(seenKey) || 0);
    } catch {
      return 0;
    }
  });

  let notifications = [];
  try {
    notifications = JSON.parse(localStorage.getItem(`dojoNotifications_${userId}`) || '[]');
  } catch {}
  const unread = notifications.filter((n) => new Date(n.date).getTime() > lastSeen).length;

  const openPanel = () => {
    const now = Date.now();
    setShowPanel(true);
    setLastSeen(now);
    try {
      localStorage.setItem(seenKey, String(now));
    } catch {}
  };

  const toggle = () => (showPanel ? setShowPanel(false) : openPanel());

  return (
    <>
      <div className="flex items-center justify-between">
        {children}
        <button onClick={toggle} className="relative p-2 rounded-full hover:bg-white/5">
          <Bell className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unread}
            </span>
          )}
        </button>
      </div>
      {showPanel && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowPanel(false)}
          onChange={() => force((n) => n + 1)}
        />
      )}
    </>
  );
};

export default NotificationBell;
