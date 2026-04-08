import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      <TopBar />
      <main className="flex-1 overflow-hidden flex pb-16 md:pb-0">
        {children}
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
