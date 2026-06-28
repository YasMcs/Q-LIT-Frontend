import React from 'react';
import Skeleton from './Skeleton';

export default function DashboardSkeleton({ count = 3 }) {
  // Generar un array basado en la cantidad solicitada
  const skeletons = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="docente-class-grid">
      {skeletons.map((idx) => (
        <div 
          key={idx} 
          className="class-card-premium border rounded-[24px] p-7 relative bg-panel border-border"
          style={{ pointerEvents: 'none' }}
        >
          {/* Header del skeleton card */}
          <div className="flex justify-between items-start gap-2">
            <div className="w-full">
              <Skeleton width="70%" height="24px" style={{ marginBottom: '8px' }} />
              <Skeleton width="40%" height="16px" />
            </div>
            <Skeleton width="32px" height="32px" borderRadius="50%" />
          </div>
          
          {/* Código de invitación skeleton */}
          <div className="mt-4 flex items-center gap-3">
            <Skeleton width="60px" height="16px" />
            <Skeleton width="100px" height="28px" borderRadius="6px" />
          </div>
          
          {/* Footer del skeleton card (Estadísticas) */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <Skeleton width="80px" height="20px" />
            <Skeleton width="90px" height="20px" />
          </div>
        </div>
      ))}
    </div>
  );
}
