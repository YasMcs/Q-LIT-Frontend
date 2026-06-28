import React from "react";
import Skeleton from "./Skeleton";

export default function ClassFeedSkeleton({ isSidebarOpen = true }) {
  return (
    <div className="feed-app-container">
      {/* Header Skeleton */}
      <header className="feed-header flex justify-between items-center px-6 py-4 border-b border-border bg-panel">
        <div className="flex gap-2 items-center">
          <Skeleton width="120px" height="20px" />
          <i className="fa-solid fa-chevron-right text-muted" />
          <Skeleton width="150px" height="20px" />
        </div>
        <div className="flex gap-4 items-center">
          <Skeleton width="100px" height="32px" borderRadius="16px" />
          <Skeleton width="40px" height="40px" borderRadius="8px" />
        </div>
      </header>

      <div className="feed-workspace flex h-[calc(100vh-73px)]">
        {/* Main Panel Skeleton */}
        <main className="feed-main-panel flex-1 p-6 overflow-y-auto">
          {/* Toolbar Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex gap-2 items-center">
              <Skeleton width="40px" height="40px" borderRadius="12px" />
              <div className="flex gap-2 bg-panel p-1.5 rounded-xl border border-border">
                <Skeleton width="80px" height="32px" borderRadius="8px" />
                <Skeleton width="80px" height="32px" borderRadius="8px" />
                <Skeleton width="80px" height="32px" borderRadius="8px" />
              </div>
            </div>
            <Skeleton width="160px" height="40px" borderRadius="12px" />
          </div>

          {/* Practice Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-panel border border-border p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <Skeleton width="60%" height="24px" className="mb-2" />
                  <Skeleton width="40%" height="16px" className="mb-4" />
                  <div className="flex gap-3">
                    <Skeleton width="100px" height="24px" borderRadius="12px" />
                    <Skeleton width="100px" height="24px" borderRadius="12px" />
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <Skeleton width="90px" height="16px" />
                  <Skeleton width="24px" height="24px" borderRadius="50%" />
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        {isSidebarOpen && (
          <aside className="w-80 flex-shrink-0 border-l border-border bg-panel p-6 overflow-y-auto hidden lg:block">
            <div className="flex justify-between items-center mb-6">
              <Skeleton width="120px" height="24px" />
              <Skeleton width="24px" height="24px" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                  <Skeleton width="32px" height="32px" borderRadius="50%" />
                  <div className="flex-1">
                    <Skeleton width="80%" height="16px" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
