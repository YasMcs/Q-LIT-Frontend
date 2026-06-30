import React from 'react';
import Skeleton from './Skeleton';

export default function EstadisticasSkeleton() {
  return (
    <main className="estadisticas-main" style={{ pointerEvents: 'none' }}>
      <header className="estadisticas-header">
        <div>
          <Skeleton width="220px" height="32px" style={{ marginBottom: '8px' }} />
          <Skeleton width="340px" height="16px" />
        </div>
        <div className="estadisticas-filters">
          <Skeleton width="180px" height="42px" borderRadius="12px" />
        </div>
      </header>

      {/* KPIs Skeleton */}
      <section className="kpi-grid">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="kpi-card border border-border bg-panel flex items-center gap-4 p-5 rounded-[24px]">
            <Skeleton width="48px" height="48px" borderRadius="14px" />
            <div className="kpi-info flex-1">
              <Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} />
              <Skeleton width="60px" height="24px" />
            </div>
          </div>
        ))}
      </section>

      {/* Dashboard Widgets Skeleton */}
      <div className="dashboard-widgets-grid">
        {/* Temas con Mayor Dificultad */}
        <section className="dashboard-widget struggles-section border border-border bg-panel p-6 rounded-[24px]">
          <div className="widget-header mb-6">
            <Skeleton width="160px" height="20px" style={{ marginBottom: '6px' }} />
            <Skeleton width="120px" height="12px" />
          </div>
          <div className="struggles-list space-y-5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="struggle-item">
                <div className="struggle-header flex justify-between mb-2">
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="40px" height="14px" />
                </div>
                <Skeleton width="100%" height="8px" borderRadius="4px" />
              </div>
            ))}
          </div>
        </section>

        {/* Desglose por Grupo */}
        <section className="dashboard-widget groups-section border border-border bg-panel p-6 rounded-[24px]">
          <div className="widget-header mb-6">
            <Skeleton width="180px" height="20px" style={{ marginBottom: '6px' }} />
            <Skeleton width="150px" height="12px" />
          </div>
          <div className="table-responsive">
            <table className="groups-table w-full">
              <thead>
                <tr>
                  <th><Skeleton width="80px" height="12px" /></th>
                  <th><Skeleton width="50px" height="12px" /></th>
                  <th><Skeleton width="60px" height="12px" /></th>
                  <th><Skeleton width="60px" height="12px" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td><Skeleton width="110px" height="14px" /></td>
                    <td><Skeleton width="40px" height="14px" /></td>
                    <td><Skeleton width="50px" height="14px" /></td>
                    <td><Skeleton width="60px" height="20px" borderRadius="20px" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
