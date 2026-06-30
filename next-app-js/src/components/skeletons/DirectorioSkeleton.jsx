import React from 'react';
import Skeleton from './Skeleton';

export default function DirectorioSkeleton() {
  return (
    <main className="directorio-main animate-fade-in" style={{ pointerEvents: 'none' }}>
      <header className="directorio-header">
        <div>
          <Skeleton width="120px" height="32px" style={{ marginBottom: '8px' }} />
          <Skeleton width="280px" height="16px" />
        </div>
        <div className="directorio-filters">
          <Skeleton width="180px" height="42px" borderRadius="12px" />
          <div className="directorio-search" style={{ background: 'transparent', border: 'none' }}>
            <Skeleton width="220px" height="42px" borderRadius="12px" />
          </div>
        </div>
      </header>

      <section className="directorio-content flex gap-6 mt-6">
        {/* Panel Central de Detalle Skeleton */}
        <div className="directorio-detail-panel flex-1 border border-border bg-panel p-6 rounded-[24px]">
          <div className="detail-header flex items-center gap-4 mb-6 border-b border-border pb-6">
            <Skeleton width="64px" height="64px" borderRadius="50%" />
            <div className="detail-header-info flex-1">
              <Skeleton width="180px" height="24px" style={{ marginBottom: '8px' }} />
              <Skeleton width="80px" height="14px" style={{ marginBottom: '6px' }} />
              <Skeleton width="140px" height="12px" />
            </div>
          </div>

          <div className="detail-body">
            <div className="practices-list space-y-4">
              <Skeleton width="150px" height="18px" style={{ marginBottom: '16px' }} />
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="practice-history-card border border-border bg-input/40 flex justify-between p-4 rounded-xl">
                  <div>
                    <Skeleton width="180px" height="14px" style={{ marginBottom: '8px' }} />
                    <Skeleton width="80px" height="10px" />
                  </div>
                  <Skeleton width="60px" height="24px" borderRadius="6px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Estudiantes (Barra Derecha) Skeleton */}
        <div className="directorio-list-panel w-[320px] border border-border bg-panel p-4 rounded-[24px] shrink-0">
          <div className="directorio-list-wrap space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="directorio-student-item flex items-center gap-3 p-3 border border-border bg-input/20 rounded-xl">
                <Skeleton width="36px" height="36px" borderRadius="50%" />
                <div className="flex-1">
                  <Skeleton width="120px" height="14px" style={{ marginBottom: '6px' }} />
                  <Skeleton width="60px" height="10px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
