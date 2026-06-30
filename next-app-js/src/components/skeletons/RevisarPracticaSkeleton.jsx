import React from 'react';
import Skeleton from './Skeleton';

export default function RevisarPracticaSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto bg-main p-6 md:p-10 animate-fade-in" style={{ pointerEvents: 'none' }}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width="90px" height="14px" />
        <Skeleton width="8px" height="14px" />
        <Skeleton width="60px" height="14px" />
        <Skeleton width="8px" height="14px" />
        <Skeleton width="80px" height="14px" />
      </div>

      {/* Header Title */}
      <header className="mb-8">
        <Skeleton width="380px" height="36px" style={{ marginBottom: '10px' }} />
        <Skeleton width="280px" height="18px" />
      </header>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        {/* Search input */}
        <Skeleton width="100%" height="48px" borderRadius="16px" style={{ maxWidth: '448px' }} />
        
        {/* Summary Metrics Box */}
        <div className="flex items-center bg-panel border-2 border-border rounded-2xl overflow-hidden shadow-sm" style={{ border: 'none' }}>
          <Skeleton width="240px" height="72px" borderRadius="16px" />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-panel border-2 border-border rounded-3xl p-6 flex flex-col justify-between h-[200px]">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Skeleton width="48px" height="48px" borderRadius="50%" />
                <div className="flex-1">
                  <Skeleton width="120px" height="16px" style={{ marginBottom: '6px' }} />
                  <Skeleton width="60px" height="12px" />
                </div>
              </div>
              <Skeleton width="80px" height="22px" borderRadius="6px" />
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <Skeleton width="90px" height="32px" borderRadius="10px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
