import React from "react";
import Skeleton from "./Skeleton";

export default function ClassFeedAlumnoSkeleton() {
  return (
    <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto py-8">
          <div className="w-full px-6 md:px-12">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Columna Principal (Feed) */}
              <div className="xl:col-span-3">
                <div className="mb-8">
                  <Skeleton width="200px" height="32px" className="mb-3" />
                  <Skeleton width="80%" height="20px" />
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Skeleton width="90px" height="40px" borderRadius="12px" />
                  <Skeleton width="120px" height="40px" borderRadius="12px" />
                  <Skeleton width="120px" height="40px" borderRadius="12px" />
                  <Skeleton width="120px" height="40px" borderRadius="12px" />
                </div>

                {/* Practices List */}
                <div className="alumno-module-block space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-panel border border-border rounded-2xl p-6">
                      <Skeleton width="50%" height="24px" className="mb-3" />
                      <div className="flex gap-4">
                        <Skeleton width="100px" height="16px" />
                        <Skeleton width="100px" height="16px" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Lateral (Pendientes) */}
              <div className="xl:col-span-1">
                <div className="bg-panel border border-border rounded-3xl p-6 shadow-sm sticky top-0">
                  <div className="border-b border-border pb-4 mb-5">
                    <Skeleton width="150px" height="24px" />
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl border border-border">
                        <Skeleton width="80%" height="16px" className="mb-2" />
                        <Skeleton width="60%" height="14px" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}
