import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ShieldProfile from '@/components/ShieldProfile';
import ProgressBar from '@/components/ProgressBar';
import WeekStrip from '@/components/WeekStrip';
import { readActivities, computeStreak, weekTrained } from '@/lib/activity';

// User's own summary card: shield + name + streak + register button + week strip
// + progression bar. Reads the user's own activity for streak and weekly count.
// Visual intentionally unchanged in this etapa.
const TodaySection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const myActivities = readActivities(user?.id);
  const streak = computeStreak(myActivities);
  const myWeek = weekTrained(myActivities);

  const handleRegister = () => navigate('/register');

  return (
    <div className="dojo-card p-4">
      <div className="flex items-center gap-4">
        <ShieldProfile
          type={user?.frame || 'black'}
          emblem={user?.emblem}
          hit={streak}
          size="small"
          photo={user?.photo}
        />
        <div className="flex-1">
          <h2 className="text-lg font-bold">Olá, {user?.name}!</h2>
          <p className="text-sm text-gray-400">{user?.mainSport || 'BJJ'}</p>
          <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`} />
            {streak > 0
              ? `${streak} ${streak === 1 ? 'dia' : 'dias'} de sequência`
              : 'Sem sequência ainda'}
          </p>
          <WeekStrip days={myWeek} />
        </div>
        <Button onClick={handleRegister} className="dojo-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Registrar
        </Button>
      </div>
      <div className="mt-4">
        <ProgressBar current={user?.progress || 20} max={user?.maxProgress || 60} label="aulas" />
      </div>
    </div>
  );
};

export default TodaySection;
