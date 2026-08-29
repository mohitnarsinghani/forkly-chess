import React from 'react';

export function MoveClassificationBadge({ classification }) {
  if (!classification) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${classification.badgeBg} text-white shadow-sm`}
    >
      <span>{classification.icon}</span>
      <span>{classification.name}</span>
    </span>
  );
}
