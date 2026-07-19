import { useState } from 'react';

import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

/**
 * The authenticated shell: fixed sidebar on desktop, off-canvas below `lg`.
 *
 * The main region carries `id="main"` so the skip link has a target — keyboard users
 * should not have to tab through the whole sidebar on every navigation.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-page">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:ml-[280px]">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main
          id="main"
          tabIndex={-1}
          className="px-6 py-6 lg:px-8 lg:py-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}