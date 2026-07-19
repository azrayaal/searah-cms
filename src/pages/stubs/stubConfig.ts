import type { ContentStatus } from '@/types/api';

/**
 * Placeholder content for the CMS modules that are not built yet.
 *
 * Fourteen of the sixteen sidebar entries used to fall through to the 404 page, which
 * made a half-finished CMS look broken rather than unfinished. Until each module gets
 * its real service, hooks and forms, every entry renders a read-only sample list from
 * this file — the shape of the screen is settled and reviewable, and nobody has to
 * guess what "Emergency" or "Applications" will eventually hold.
 *
 * Everything here is fabricated. It is written to be *plausible* for Searah — the
 * Eni/PETRONAS upstream JV and its operating companies SKT (Searah Ketapang), SMB
 * (Searah Muara Bakau) and SMY (Searah Malaysia) — because sample data that reads
 * like the real thing is what makes a layout review useful. It is deliberately not
 * fetched from anywhere: no service, no query, nothing to accidentally leave wired up
 * when the real module lands.
 */

/** A single cell. Badges and statuses are described, not rendered, so the config stays JSX-free. */
export type StubCell =
  | string
  | { kind: 'badge'; label: string }
  | { kind: 'status'; status: ContentStatus };

export interface StubColumn {
  key: string;
  label: string;
  /** Trailing-aligned columns — counts, sizes, dates that read better right-ragged. */
  align?: 'right';
  /** Rendered in the muted secondary grey, for metadata that should not compete with the row's subject. */
  muted?: boolean;
}

export interface StubPageConfig {
  title: string;
  description: string;
  /** Trailing breadcrumb label; the leading "Dashboard" crumb is added by the page. */
  breadcrumb: string;
  columns: StubColumn[];
  rows: Record<string, StubCell>[];
}

export type StubResourceKey =
  | 'about'
  | 'leadership'
  | 'gallery'
  | 'resource'
  | 'faq'
  | 'legal'
  | 'production'
  | 'application'
  | 'contact'
  | 'emergency'
  | 'media'
  | 'user'
  | 'audit'
  | 'setting';

export const STUB_PAGES: Record<StubResourceKey, StubPageConfig> = {
  about: {
    title: 'About',
    description: 'Corporate profile sections shown on the public About pages.',
    breadcrumb: 'About',
    columns: [
      { key: 'section', label: 'Section' },
      { key: 'scope', label: 'Scope' },
      { key: 'status', label: 'Status' },
      { key: 'updated', label: 'Last updated', muted: true },
    ],
    rows: [
      {
        section: 'Who We Are',
        scope: { kind: 'badge', label: 'Group' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '12 Mar 2025',
      },
      {
        section: 'Vision, Mission & Values',
        scope: { kind: 'badge', label: 'Group' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '4 Feb 2025',
      },
      {
        section: 'Our Joint Venture — Eni & PETRONAS',
        scope: { kind: 'badge', label: 'Group' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '28 Jan 2025',
      },
      {
        section: 'Searah Ketapang (SKT)',
        scope: { kind: 'badge', label: 'SKT' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '19 Apr 2025',
      },
      {
        section: 'Searah Muara Bakau (SMB)',
        scope: { kind: 'badge', label: 'SMB' },
        status: { kind: 'status', status: 'DRAFT' },
        updated: '2 May 2025',
      },
      {
        section: 'Searah Malaysia (SMY)',
        scope: { kind: 'badge', label: 'SMY' },
        status: { kind: 'status', status: 'DRAFT' },
        updated: '6 May 2025',
      },
    ],
  },

  leadership: {
    title: 'Leadership',
    description: 'Board of Commissioners, Directors and operating-company management.',
    breadcrumb: 'Leadership',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'position', label: 'Position' },
      { key: 'body', label: 'Body' },
      { key: 'status', label: 'Status' },
      { key: 'since', label: 'Appointed', muted: true },
    ],
    rows: [
      {
        name: 'Ir. Bambang Setiawan',
        position: 'President Director',
        body: { kind: 'badge', label: 'Board of Directors' },
        status: { kind: 'status', status: 'PUBLISHED' },
        since: '1 Jul 2021',
      },
      {
        name: 'Nurul Aisyah binti Rahman',
        position: 'Director of Finance',
        body: { kind: 'badge', label: 'Board of Directors' },
        status: { kind: 'status', status: 'PUBLISHED' },
        since: '15 Jan 2022',
      },
      {
        name: 'Marco Ferrari',
        position: 'Director of Operations',
        body: { kind: 'badge', label: 'Board of Directors' },
        status: { kind: 'status', status: 'PUBLISHED' },
        since: '3 Oct 2022',
      },
      {
        name: 'Dr. Sri Wahyuni Pratama',
        position: 'President Commissioner',
        body: { kind: 'badge', label: 'Commissioners' },
        status: { kind: 'status', status: 'PUBLISHED' },
        since: '12 May 2020',
      },
      {
        name: 'Ahmad Zulkifli bin Hassan',
        position: 'General Manager, SMY',
        body: { kind: 'badge', label: 'Management' },
        status: { kind: 'status', status: 'DRAFT' },
        since: '1 Feb 2025',
      },
    ],
  },

  gallery: {
    title: 'Gallery',
    description: 'Photo and video albums used across the corporate portal.',
    breadcrumb: 'Gallery',
    columns: [
      { key: 'album', label: 'Album' },
      { key: 'type', label: 'Type' },
      { key: 'items', label: 'Items', align: 'right' },
      { key: 'status', label: 'Status' },
      { key: 'captured', label: 'Captured', muted: true },
    ],
    rows: [
      {
        album: 'Jangkrik Floating Production Unit — Offshore Visit',
        type: { kind: 'badge', label: 'Photo' },
        items: '48',
        status: { kind: 'status', status: 'PUBLISHED' },
        captured: '18 Feb 2025',
      },
      {
        album: 'HSE Week 2025 — Balikpapan Office',
        type: { kind: 'badge', label: 'Photo' },
        items: '126',
        status: { kind: 'status', status: 'PUBLISHED' },
        captured: '11 Mar 2025',
      },
      {
        album: 'Merakes East Tie-in Campaign',
        type: { kind: 'badge', label: 'Video' },
        items: '6',
        status: { kind: 'status', status: 'PUBLISHED' },
        captured: '24 Apr 2025',
      },
      {
        album: 'Community Programme — Kutai Kartanegara',
        type: { kind: 'badge', label: 'Photo' },
        items: '73',
        status: { kind: 'status', status: 'DRAFT' },
        captured: '9 May 2025',
      },
      {
        album: 'Kuala Lumpur Office Opening',
        type: { kind: 'badge', label: 'Photo' },
        items: '31',
        status: { kind: 'status', status: 'ARCHIVED' },
        captured: '2 Sep 2023',
      },
    ],
  },

  resource: {
    title: 'Resources',
    description: 'Downloadable reports, factsheets and technical publications.',
    breadcrumb: 'Resources',
    columns: [
      { key: 'title', label: 'Document' },
      { key: 'category', label: 'Category' },
      { key: 'format', label: 'Format', muted: true },
      { key: 'status', label: 'Status' },
      { key: 'published', label: 'Published', muted: true },
    ],
    rows: [
      {
        title: 'Sustainability Report 2024',
        category: { kind: 'badge', label: 'Sustainability' },
        format: 'PDF · 8.4 MB',
        status: { kind: 'status', status: 'PUBLISHED' },
        published: '30 Apr 2025',
      },
      {
        title: 'Annual Production Overview 2024',
        category: { kind: 'badge', label: 'Operations' },
        format: 'PDF · 3.1 MB',
        status: { kind: 'status', status: 'PUBLISHED' },
        published: '17 Mar 2025',
      },
      {
        title: 'SKT Ketapang Block Factsheet',
        category: { kind: 'badge', label: 'Factsheet' },
        format: 'PDF · 1.2 MB',
        status: { kind: 'status', status: 'PUBLISHED' },
        published: '5 Feb 2025',
      },
      {
        title: 'Vendor Prequalification Guidelines',
        category: { kind: 'badge', label: 'Procurement' },
        format: 'DOCX · 640 KB',
        status: { kind: 'status', status: 'DRAFT' },
        published: '—',
      },
      {
        title: 'Local Content Policy (rev. 2)',
        category: { kind: 'badge', label: 'Governance' },
        format: 'PDF · 900 KB',
        status: { kind: 'status', status: 'ARCHIVED' },
        published: '14 Jun 2023',
      },
    ],
  },

  faq: {
    title: 'FAQ',
    description: 'Questions answered on the public site, grouped by topic.',
    breadcrumb: 'FAQ',
    columns: [
      { key: 'question', label: 'Question' },
      { key: 'topic', label: 'Topic' },
      { key: 'status', label: 'Status' },
      { key: 'updated', label: 'Last updated', muted: true },
    ],
    rows: [
      {
        question: 'How do I register as a vendor for Searah?',
        topic: { kind: 'badge', label: 'Procurement' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '21 Apr 2025',
      },
      {
        question: 'Which blocks does Searah operate in Indonesia and Malaysia?',
        topic: { kind: 'badge', label: 'Operations' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '8 Mar 2025',
      },
      {
        question: 'How can I report a safety or integrity concern?',
        topic: { kind: 'badge', label: 'HSE' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '2 Feb 2025',
      },
      {
        question: 'Does Searah offer internships for engineering students?',
        topic: { kind: 'badge', label: 'Careers' },
        status: { kind: 'status', status: 'PUBLISHED' },
        updated: '19 Jan 2025',
      },
      {
        question: 'What is the status of the Merakes East development?',
        topic: { kind: 'badge', label: 'Projects' },
        status: { kind: 'status', status: 'DRAFT' },
        updated: '13 May 2025',
      },
    ],
  },

  legal: {
    title: 'Legal',
    description: 'Policies and legal notices published on the corporate portal.',
    breadcrumb: 'Legal',
    columns: [
      { key: 'document', label: 'Document' },
      { key: 'type', label: 'Type' },
      { key: 'version', label: 'Version', muted: true },
      { key: 'status', label: 'Status' },
      { key: 'effective', label: 'Effective', muted: true },
    ],
    rows: [
      {
        document: 'Privacy Policy',
        type: { kind: 'badge', label: 'Policy' },
        version: 'v3.0',
        status: { kind: 'status', status: 'PUBLISHED' },
        effective: '1 Jan 2025',
      },
      {
        document: 'Terms of Use',
        type: { kind: 'badge', label: 'Notice' },
        version: 'v2.1',
        status: { kind: 'status', status: 'PUBLISHED' },
        effective: '1 Jan 2025',
      },
      {
        document: 'Code of Business Conduct',
        type: { kind: 'badge', label: 'Governance' },
        version: 'v4.2',
        status: { kind: 'status', status: 'PUBLISHED' },
        effective: '15 Aug 2024',
      },
      {
        document: 'Anti-Bribery & Corruption Policy',
        type: { kind: 'badge', label: 'Compliance' },
        version: 'v2.0',
        status: { kind: 'status', status: 'PUBLISHED' },
        effective: '3 Jun 2024',
      },
      {
        document: 'Whistleblowing Procedure',
        type: { kind: 'badge', label: 'Compliance' },
        version: 'v1.4',
        status: { kind: 'status', status: 'DRAFT' },
        effective: '—',
      },
      {
        document: 'Cookie Notice',
        type: { kind: 'badge', label: 'Notice' },
        version: 'v1.0',
        status: { kind: 'status', status: 'ARCHIVED' },
        effective: '9 Nov 2022',
      },
    ],
  },

  production: {
    title: 'Production Rate',
    description: 'Monthly gas and condensate figures published per operating company.',
    breadcrumb: 'Production Rate',
    columns: [
      { key: 'period', label: 'Period' },
      { key: 'entity', label: 'Operating company' },
      { key: 'gas', label: 'Gas (MMSCFD)', align: 'right' },
      { key: 'condensate', label: 'Condensate (BOPD)', align: 'right' },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      {
        period: 'May 2025',
        entity: { kind: 'badge', label: 'SMB' },
        gas: '742.5',
        condensate: '4,180',
        status: { kind: 'status', status: 'DRAFT' },
      },
      {
        period: 'April 2025',
        entity: { kind: 'badge', label: 'SMB' },
        gas: '758.1',
        condensate: '4,312',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        period: 'April 2025',
        entity: { kind: 'badge', label: 'SKT' },
        gas: '196.4',
        condensate: '1,027',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        period: 'April 2025',
        entity: { kind: 'badge', label: 'SMY' },
        gas: '318.9',
        condensate: '2,455',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        period: 'March 2025',
        entity: { kind: 'badge', label: 'SMB' },
        gas: '766.3',
        condensate: '4,401',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        period: 'March 2025',
        entity: { kind: 'badge', label: 'SKT' },
        gas: '188.7',
        condensate: '985',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
    ],
  },

  application: {
    title: 'Applications',
    description: 'Internal systems linked from the employee portal launcher.',
    breadcrumb: 'Applications',
    columns: [
      { key: 'name', label: 'Application' },
      { key: 'category', label: 'Category' },
      { key: 'owner', label: 'Owner', muted: true },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      {
        name: 'SIMOPS Permit to Work',
        category: { kind: 'badge', label: 'Operations' },
        owner: 'HSE Department',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        name: 'e-Procurement Portal',
        category: { kind: 'badge', label: 'Procurement' },
        owner: 'Supply Chain Management',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        name: 'Employee Self Service (ESS)',
        category: { kind: 'badge', label: 'Human Capital' },
        owner: 'Human Capital',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        name: 'Well Data Repository',
        category: { kind: 'badge', label: 'Subsurface' },
        owner: 'Exploration & Development',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        name: 'Travel & Logistics Booking',
        category: { kind: 'badge', label: 'Support' },
        owner: 'General Services',
        status: { kind: 'status', status: 'DRAFT' },
      },
    ],
  },

  contact: {
    title: 'Contact',
    description: 'Office locations and enquiry channels listed on the contact page.',
    breadcrumb: 'Contact',
    columns: [
      { key: 'office', label: 'Office' },
      { key: 'type', label: 'Type' },
      { key: 'city', label: 'City', muted: true },
      { key: 'phone', label: 'Phone', muted: true },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      {
        office: 'Searah Head Office',
        type: { kind: 'badge', label: 'Headquarters' },
        city: 'Jakarta Selatan, Indonesia',
        phone: '+62 21 2555 8800',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        office: 'Balikpapan Operations Base',
        type: { kind: 'badge', label: 'Operations' },
        city: 'Balikpapan, Kalimantan Timur',
        phone: '+62 542 749 200',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        office: 'Searah Malaysia (SMY)',
        type: { kind: 'badge', label: 'Regional' },
        city: 'Kuala Lumpur, Malaysia',
        phone: '+60 3 2181 4400',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        office: 'Media & Public Relations',
        type: { kind: 'badge', label: 'Enquiry' },
        city: 'Jakarta Selatan, Indonesia',
        phone: '+62 21 2555 8815',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        office: 'Vendor Registration Desk',
        type: { kind: 'badge', label: 'Enquiry' },
        city: 'Balikpapan, Kalimantan Timur',
        phone: '+62 542 749 218',
        status: { kind: 'status', status: 'DRAFT' },
      },
    ],
  },

  emergency: {
    title: 'Emergency',
    description: 'Emergency response contacts and reporting channels.',
    breadcrumb: 'Emergency',
    columns: [
      { key: 'channel', label: 'Channel' },
      { key: 'scope', label: 'Scope' },
      { key: 'number', label: 'Number', muted: true },
      { key: 'availability', label: 'Availability', muted: true },
      { key: 'status', label: 'Status' },
    ],
    rows: [
      {
        channel: 'Emergency Response Centre',
        scope: { kind: 'badge', label: 'Group' },
        number: '+62 21 2555 8899',
        availability: '24/7',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        channel: 'Offshore Medevac Coordinator',
        scope: { kind: 'badge', label: 'SMB' },
        number: '+62 542 749 911',
        availability: '24/7',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        channel: 'Oil Spill Response Desk',
        scope: { kind: 'badge', label: 'SKT' },
        number: '+62 542 749 933',
        availability: '24/7',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        channel: 'Integrity & Whistleblowing Hotline',
        scope: { kind: 'badge', label: 'Group' },
        number: '+62 800 1500 730',
        availability: 'Mon–Fri, 08:00–17:00 WIB',
        status: { kind: 'status', status: 'PUBLISHED' },
      },
      {
        channel: 'SMY Crisis Management Team',
        scope: { kind: 'badge', label: 'SMY' },
        number: '+60 3 2181 4499',
        availability: '24/7',
        status: { kind: 'status', status: 'DRAFT' },
      },
    ],
  },

  media: {
    title: 'Media Library',
    description: 'Images, video and documents available to every content module.',
    breadcrumb: 'Media Library',
    columns: [
      { key: 'file', label: 'File' },
      { key: 'type', label: 'Type' },
      { key: 'size', label: 'Size', align: 'right', muted: true },
      { key: 'usedIn', label: 'Used in', muted: true },
      { key: 'uploaded', label: 'Uploaded', muted: true },
    ],
    rows: [
      {
        file: 'jangkrik-fpu-aerial.jpg',
        type: { kind: 'badge', label: 'Image' },
        size: '4.2 MB',
        usedIn: 'Gallery, Newsletter',
        uploaded: '18 Feb 2025',
      },
      {
        file: 'sustainability-report-2024.pdf',
        type: { kind: 'badge', label: 'Document' },
        size: '8.4 MB',
        usedIn: 'Resources',
        uploaded: '30 Apr 2025',
      },
      {
        file: 'searah-logo-primary.svg',
        type: { kind: 'badge', label: 'Image' },
        size: '38 KB',
        usedIn: 'Settings, About',
        uploaded: '4 Jan 2024',
      },
      {
        file: 'hse-week-2025-highlights.mp4',
        type: { kind: 'badge', label: 'Video' },
        size: '186 MB',
        usedIn: 'Gallery',
        uploaded: '13 Mar 2025',
      },
      {
        file: 'merakes-east-schematic.png',
        type: { kind: 'badge', label: 'Image' },
        size: '1.9 MB',
        usedIn: 'Not used',
        uploaded: '24 Apr 2025',
      },
    ],
  },

  user: {
    title: 'Users',
    description: 'CMS accounts and the roles that govern what each one can reach.',
    breadcrumb: 'Users',
    columns: [
      { key: 'name', label: 'User' },
      { key: 'role', label: 'Role' },
      { key: 'unit', label: 'Business unit', muted: true },
      { key: 'lastActive', label: 'Last active', muted: true },
    ],
    rows: [
      {
        name: 'Dian Permatasari · dian.permatasari@searah.co.id',
        role: { kind: 'badge', label: 'Super Admin' },
        unit: 'Corporate Communications',
        lastActive: 'Today, 09:14',
      },
      {
        name: 'Rizky Nugroho · rizky.nugroho@searah.co.id',
        role: { kind: 'badge', label: 'Editor' },
        unit: 'Corporate Communications',
        lastActive: 'Today, 08:02',
      },
      {
        name: 'Farah Iskandar · farah.iskandar@searah.com.my',
        role: { kind: 'badge', label: 'Editor' },
        unit: 'Searah Malaysia (SMY)',
        lastActive: 'Yesterday, 16:47',
      },
      {
        name: 'Agus Hermawan · agus.hermawan@searah.co.id',
        role: { kind: 'badge', label: 'Contributor' },
        unit: 'HSE Department',
        lastActive: '12 May 2025',
      },
      {
        name: 'Lina Kusuma · lina.kusuma@searah.co.id',
        role: { kind: 'badge', label: 'Viewer' },
        unit: 'Legal & Compliance',
        lastActive: '28 Apr 2025',
      },
    ],
  },

  audit: {
    title: 'Audit Log',
    description: 'Every create, update and publish recorded against a CMS account.',
    breadcrumb: 'Audit Log',
    columns: [
      { key: 'action', label: 'Action' },
      { key: 'module', label: 'Module' },
      { key: 'actor', label: 'Performed by', muted: true },
      { key: 'ip', label: 'IP address', muted: true },
      { key: 'at', label: 'Timestamp', align: 'right', muted: true },
    ],
    rows: [
      {
        action: 'Published "Merakes East reaches first gas"',
        module: { kind: 'badge', label: 'Newsletter' },
        actor: 'Rizky Nugroho',
        ip: '103.28.14.66',
        at: '20 May 2025, 09:41',
      },
      {
        action: 'Updated April 2025 production figures (SMB)',
        module: { kind: 'badge', label: 'Production' },
        actor: 'Agus Hermawan',
        ip: '103.28.14.91',
        at: '19 May 2025, 15:08',
      },
      {
        action: 'Uploaded 12 files to "HSE Week 2025"',
        module: { kind: 'badge', label: 'Gallery' },
        actor: 'Farah Iskandar',
        ip: '175.140.22.7',
        at: '19 May 2025, 11:52',
      },
      {
        action: 'Changed role of Lina Kusuma to Viewer',
        module: { kind: 'badge', label: 'Users' },
        actor: 'Dian Permatasari',
        ip: '103.28.14.66',
        at: '16 May 2025, 08:30',
      },
      {
        action: 'Archived "Cookie Notice v1.0"',
        module: { kind: 'badge', label: 'Legal' },
        actor: 'Dian Permatasari',
        ip: '103.28.14.66',
        at: '14 May 2025, 17:19',
      },
    ],
  },

  setting: {
    title: 'Settings',
    description: 'Portal-wide configuration shared by every public-facing module.',
    breadcrumb: 'Settings',
    columns: [
      { key: 'setting', label: 'Setting' },
      { key: 'group', label: 'Group' },
      { key: 'value', label: 'Current value', muted: true },
      { key: 'updated', label: 'Last updated', muted: true },
    ],
    rows: [
      {
        setting: 'Site name',
        group: { kind: 'badge', label: 'General' },
        value: 'Searah',
        updated: '4 Jan 2024',
      },
      {
        setting: 'Default language',
        group: { kind: 'badge', label: 'General' },
        value: 'Bahasa Indonesia (id-ID)',
        updated: '4 Jan 2024',
      },
      {
        setting: 'Contact enquiry recipient',
        group: { kind: 'badge', label: 'Contact' },
        value: 'corpcomm@searah.co.id',
        updated: '11 Feb 2025',
      },
      {
        setting: 'Newsletter items per page',
        group: { kind: 'badge', label: 'Content' },
        value: '15',
        updated: '22 Mar 2025',
      },
      {
        setting: 'Maximum upload size',
        group: { kind: 'badge', label: 'Media' },
        value: '250 MB',
        updated: '13 Mar 2025',
      },
      {
        setting: 'Session timeout',
        group: { kind: 'badge', label: 'Security' },
        value: '30 minutes',
        updated: '2 May 2025',
      },
    ],
  },
};
