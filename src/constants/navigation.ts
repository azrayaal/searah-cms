import {
  Building2,
  FileText,
  Gauge,
  HelpCircle,
  Image,
  LayoutDashboard,
  LifeBuoy,
  Images,
  Mail,
  Newspaper,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Grid3x3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Hidden unless the signed-in user holds this permission. */
  permission: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar structure.
 *
 * Grouped by what an editor is trying to do rather than by database table — "Content"
 * and "Operations" are how the work is actually organised, and a flat list of
 * thirteen modules is a menu nobody reads.
 */
export const navigation: NavSection[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', to: '/', icon: LayoutDashboard, permission: 'about:read' }],
  },
  {
    title: 'Content',
    items: [
      { label: 'About', to: '/about', icon: Building2, permission: 'about:read' },
      { label: 'Newsletter', to: '/newsletters', icon: Newspaper, permission: 'newsletter:read' },
      { label: 'Leadership', to: '/leadership', icon: Users, permission: 'leadership:read' },
      { label: 'Gallery', to: '/galleries', icon: Images, permission: 'gallery:read' },
      { label: 'Resources', to: '/resources', icon: FileText, permission: 'resource:read' },
      { label: 'FAQ', to: '/faqs', icon: HelpCircle, permission: 'faq:read' },
      { label: 'Legal', to: '/legal', icon: ScrollText, permission: 'legal:read' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Production Rate', to: '/production', icon: Gauge, permission: 'production:read' },
      { label: 'Applications', to: '/applications', icon: Grid3x3, permission: 'application:read' },
      { label: 'Contact', to: '/contacts', icon: Mail, permission: 'contact:read' },
      { label: 'Emergency', to: '/emergency', icon: LifeBuoy, permission: 'emergency:read' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Media Library', to: '/media', icon: Image, permission: 'media:read' },
      { label: 'Users', to: '/users', icon: Users, permission: 'user:read' },
      { label: 'Audit Log', to: '/audit-logs', icon: ShieldCheck, permission: 'audit:read' },
      { label: 'Settings', to: '/settings', icon: Settings, permission: 'setting:read' },
    ],
  },
];
