import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { navigation } from '@/constants/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/auth.store';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const can = useAuthStore((state) => state.can);

  // Sections whose every item is hidden are dropped entirely, so an Editor does not
  // see a "System" heading with nothing under it.
  const visibleSections = navigation
    .map((section) => ({ ...section, items: section.items.filter((item) => can(item.permission)) }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile scrim. aria-hidden because the close affordance is the button below. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-primary-900/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/*
        The navy ground is the anchor for the whole app: it gives the layout a fixed
        dark edge to sit against, and it is the same #0A2A5E band the landing page
        uses, so the two products read as one.
      */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col bg-surface-dark text-white',
          'transition-transform duration-200 ease-premium lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-nav shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
          {/*
            The logo is a flat full-colour mark drawn for a white ground, so it keeps
            one here — a white plate — rather than being dropped onto the navy where
            its darker inks would disappear.
          */}
          <span className="flex w-full items-center justify-center">
            <img src="/Searah-logo-white.png" alt="Searah" className="h-18 w-auto" />
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4">
          {visibleSections.map((section) => (
            <div key={section.title} className="mb-5">
              {/* primary-300 is a fill on white, but on the navy it lands at 6.2:1 —
                  exactly the muted-but-legible eyebrow this needs. */}
              <p className="px-3 pb-2 text-label uppercase text-primary-300">{section.title}</p>

              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      // `end` only on the dashboard: without it, "/" would stay
                      // highlighted on every child route.
                      end={item.to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-btn px-3 py-2 text-sm font-medium',
                          'transition-colors duration-150 ease-premium',
                          // Active inverts to a white plate with navy type: the single
                          // lightest thing in the panel, so "where am I" is answered
                          // by brightness before colour.
                          isActive
                            ? 'bg-white text-primary shadow-card'
                            : 'text-primary-200 hover:bg-white/10 hover:text-white',
                        )
                      }
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
