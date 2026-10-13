import React from 'react';

const ShieldProfile = ({ type = 'black', years = 1, size = 'medium', photo = null }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const frameClasses = {
    black: 'shield-black',
    coral: 'shield-coral',
    white: 'shield-white'
  };

  const yearsBadgeSize = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  };

  return (
    <div className="relative inline-block">
      <div className={`shield-frame ${frameClasses[type]} ${sizeClasses[size]} overflow-hidden`}>
        {photo ? (
          <img src={photo} alt="Foto do perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">🥋</span>
        )}
      </div>
      <div className={`years-badge ${yearsBadgeSize[size]}`}>
        {years}
      </div>
    </div>
  );
};

export default ShieldProfile;