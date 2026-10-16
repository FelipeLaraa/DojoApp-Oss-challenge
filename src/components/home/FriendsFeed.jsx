import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { characters } from '@/data/characters';
import FriendsStories from './FriendsStories';
import MilestoneCard from './MilestoneCard';
import FriendsRanking from './FriendsRanking';

const mergeSaved = (character) => {
  try {
    const saved = localStorage.getItem(`dojoProfile_${character.id}`);
    return saved ? { ...character, ...JSON.parse(saved) } : character;
  } catch {
    return character;
  }
};

// Feed novo: stories, marco de hoje (opcional), mini-ranking.
// Sem cards de reação — foi substituído pelo loop de stories + ranking.
const FriendsFeed = () => {
  const { user } = useAuth();
  const friends = characters.filter((c) => c.id !== user?.id).map(mergeSaved);

  return (
    <div className="space-y-6">
      <FriendsStories friends={friends} />
      <MilestoneCard friends={friends} />
      <FriendsRanking friends={friends} />
    </div>
  );
};

export default FriendsFeed;
