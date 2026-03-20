import React from 'react';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg">
      <TopBar />
      <main className="flex-1 overflow-hidden flex">
        {children}
      </main>
    </div>
  );
}
