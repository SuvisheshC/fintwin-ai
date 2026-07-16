import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
