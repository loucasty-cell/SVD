import React from 'react';

export const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl ${className}`}>
    {children}
  </div>
);
