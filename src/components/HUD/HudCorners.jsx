import React from 'react';

export function HudCorners({ color = 'border-amber-400/80' }) {
  return (
    <>
      {/* Top-Left Corner */}
      <span className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${color} pointer-events-none z-20`} />
      {/* Top-Right Corner */}
      <span className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${color} pointer-events-none z-20`} />
      {/* Bottom-Left Corner */}
      <span className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${color} pointer-events-none z-20`} />
      {/* Bottom-Right Corner */}
      <span className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${color} pointer-events-none z-20`} />
    </>
  );
}
