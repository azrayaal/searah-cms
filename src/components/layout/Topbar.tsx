import { useState } from 'react';

import { ChevronDown, ExternalLink, KeyRound, LogOut, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/auth.store';

const LANDING_URL = import.meta.env['VITE_LANDING_URL'] ?? 'http://localhost:5173';

export interface TopbarProps {
  onOpenSidebar: () => void;
}

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <header className="sticky top-0 z-20 flex h-nav items-center justify-between border-b border-primary-100 bg-white px-4 lg:px-6">
      <Button variant="ghost" size="sm" onClick={onOpenSidebar} className="lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="flex flex-1 items-center justify-end gap-2">
        <a
          href={LANDING_URL}
          target="_blank"
          // noreferrer alongside noopener: the opened page should learn neither our
          // window handle nor the URL the editor came from.
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-btn border border-primary-200 bg-primary-100/60 px-3 py-2
                     text-sm font-medium text-primary transition-colors duration-150 ease-premium
                     hover:bg-primary-100 sm:inline-flex"
        >
          View site
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 rounded-btn py-1.5 pl-1.5 pr-2.5 transition-colors duration-150
                       ease-premium hover:bg-primary-100"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
            >
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-gray-900">{user?.name}</span>
              <span className="block text-caption font-normal text-gray-700">{user?.role.name}</span>
            </span>
            <ChevronDown
              className={cn('h-4 w-4 text-primary-500 transition-transform duration-200 ease-premium', menuOpen && 'rotate-180')}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <>
              {/* Click-away layer. Sits below the menu so the menu stays clickable. */}
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />

              <div
                role="menu"
                className="absolute right-0 z-20 mt-2 w-60 animate-slide-up overflow-hidden rounded-card
                           border border-gray-300/60 bg-white shadow-dropdown"
              >
                {/* Navy header plate: the menu belongs to the account, and the tinted
                    band says so without needing a second heading. */}
                <div className="border-b border-primary-200 bg-primary-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-primary">{user?.name}</p>
                  <p className="truncate text-caption font-normal text-gray-700">{user?.email}</p>
                </div>

                <div className="p-1.5">
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-btn px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    Profile
                  </Link>

                  <Link
                    to="/profile/password"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-btn px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-primary-100 hover:text-primary"
                  >
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    Change password
                  </Link>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                    className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-sm text-burgundy
                               hover:bg-burgundy-100 disabled:opacity-55"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    {logout.isPending ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
