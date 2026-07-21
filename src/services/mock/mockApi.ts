/**
 * In-memory stand-in for the Searah REST API.
 *
 * The backend is not up yet, so every request the app makes is answered from here
 * instead of the network. `apiClient` routes its helpers through `mockRequest` and
 * keeps the real axios call commented directly above — flipping back to the live API
 * is uncommenting those lines and deleting this folder, nothing else.
 *
 * State lives in module-level arrays: writes are visible for the rest of the session
 * (create an article, it appears in the list) and reset on reload. Everything is
 * fabricated but shaped exactly like `@/types/api`, so screens exercise the same
 * envelope, pagination and error paths they will hit for real.
 */

import { ApiRequestError, getRefreshToken } from '@/services/apiClient';
import type {
  ApiEnvelope,
  CurrentUser,
  LoginResponse,
  MediaAsset,
  Newsletter,
  NewsletterAttachment,
} from '@/types/api';

/** Simulated latency, so loading states are visible rather than skipped. */
const LATENCY_MS = 250;

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

function envelope<T>(data: T, message = 'OK', meta: ApiEnvelope<T>['meta'] = {}): ApiEnvelope<T> {
  return { success: true, message, data, meta };
}

/* ------------------------------------------------------------------ Session */

const MOCK_USER: CurrentUser = {
  id: 'usr-1',
  email: 'dian.permatasari@searah.co.id',
  name: 'Dian Permatasari',
  position: 'Head of Corporate Communications',
  avatarUrl: null,
  lastLoginAt: '2025-05-20T02:14:00.000Z',
  role: { id: 'rol-1', key: 'SUPER_ADMIN', name: 'Super Admin' },
  // The wildcard keeps every sidebar entry and action button reachable while the
  // screens are being reviewed.
  permissions: ['*:*'],
};

let currentUser: CurrentUser = { ...MOCK_USER };

/* -------------------------------------------------------------- Newsletters */

const paragraph = (text: string) => ({ type: 'paragraph' as const, text });

let newsletters: Newsletter[] = [
  {
    id: 'nws-1',
    slug: 'merakes-east-reaches-first-gas',
    title: 'Merakes East reaches first gas ahead of schedule',
    excerpt:
      'The tie-in campaign at Merakes East delivered first gas six weeks early, adding capacity to the Jangkrik Floating Production Unit.',
    category: 'Operations',
    entityCode: 'SMB',
    thumbnailUrl: null,
    coverUrl: null,
    pdfUrl: null,
    thumbnailAlt: null,
    coverAlt: 'Jangkrik Floating Production Unit at dawn',
    coverCaption: 'The Jangkrik FPU, offshore Kalimantan Timur.',
    coverCredit: 'Searah Muara Bakau',
    content: [
      paragraph(
        'Searah Muara Bakau confirmed first gas from the Merakes East development, six weeks ahead of the schedule agreed at final investment decision.',
      ),
      { type: 'heading', text: 'A campaign delivered without lost time' },
      paragraph(
        'The subsea tie-in was completed across a 34-day offshore window with no lost-time incidents recorded.',
      ),
      {
        type: 'quote',
        text: 'Bringing Merakes East online early is the result of planning that started three years ago.',
        attribution: 'Marco Ferrari, Director of Operations',
      },
      {
        type: 'stat',
        items: [
          { label: 'Added capacity', value: '85 MMSCFD' },
          { label: 'Ahead of plan', value: '6 weeks' },
          { label: 'LTI', value: 'Zero' },
        ],
      },
    ],
    gallery: null,
    tags: ['Merakes', 'Production', 'Offshore'],
    authorName: 'Rizky Nugroho',
    authorRole: 'Corporate Communications',
    readingTime: '4 min read',
    featured: true,
    showOnHome: true,
    seoTitle: null,
    seoDescription: null,
    status: 'PUBLISHED',
    publishedAt: '2025-05-20T02:41:00.000Z',
    createdAt: '2025-05-18T04:12:00.000Z',
    updatedAt: '2025-05-20T02:41:00.000Z',
  },
  {
    id: 'nws-2',
    slug: 'hse-week-2025-balikpapan',
    title: 'HSE Week 2025 draws record participation in Balikpapan',
    excerpt: 'More than 900 employees and contractors joined a week of drills, clinics and safety workshops.',
    category: 'Safety',
    entityCode: null,
    thumbnailUrl: null,
    coverUrl: null,
    pdfUrl: null,
    thumbnailAlt: null,
    coverAlt: null,
    coverCaption: null,
    coverCredit: null,
    content: [
      paragraph(
        'The 2025 edition of HSE Week ran across the Balikpapan operations base and the head office in Jakarta.',
      ),
      { type: 'list', items: ['Emergency response drills', 'Occupational health clinics', 'Contractor safety forum'] },
    ],
    gallery: null,
    tags: ['HSE', 'People'],
    authorName: 'Agus Hermawan',
    authorRole: 'HSE Department',
    readingTime: '3 min read',
    featured: false,
    showOnHome: true,
    seoTitle: null,
    seoDescription: null,
    status: 'PUBLISHED',
    publishedAt: '2025-03-14T08:00:00.000Z',
    createdAt: '2025-03-12T09:30:00.000Z',
    updatedAt: '2025-03-14T08:00:00.000Z',
  },
  {
    id: 'nws-3',
    slug: 'sustainability-report-2024-published',
    title: 'Sustainability Report 2024 published',
    excerpt: 'The fourth annual report covers emissions intensity, local content and community programmes.',
    category: 'Sustainability',
    entityCode: null,
    thumbnailUrl: null,
    coverUrl: null,
    pdfUrl: null,
    thumbnailAlt: null,
    coverAlt: null,
    coverCaption: null,
    coverCredit: null,
    content: [paragraph('The report is available to download from the Resources section of the portal.')],
    gallery: null,
    tags: ['Sustainability', 'Reporting'],
    authorName: 'Dian Permatasari',
    authorRole: 'Corporate Communications',
    readingTime: '2 min read',
    featured: false,
    showOnHome: false,
    seoTitle: null,
    seoDescription: null,
    status: 'PUBLISHED',
    publishedAt: '2025-04-30T03:00:00.000Z',
    createdAt: '2025-04-28T07:45:00.000Z',
    updatedAt: '2025-04-30T03:00:00.000Z',
  },
  {
    id: 'nws-4',
    slug: 'smy-opens-kuala-lumpur-office',
    title: 'Searah Malaysia opens its Kuala Lumpur office',
    excerpt: 'SMY moves into a permanent base at Menara Binjai as the Malaysian portfolio grows.',
    category: 'Corporate',
    entityCode: 'SMY',
    thumbnailUrl: null,
    coverUrl: null,
    pdfUrl: null,
    thumbnailAlt: null,
    coverAlt: null,
    coverCaption: null,
    coverCredit: null,
    content: [paragraph('The office houses subsurface, operations and corporate services teams.')],
    gallery: null,
    tags: ['SMY', 'Corporate'],
    authorName: 'Farah Iskandar',
    authorRole: 'Searah Malaysia',
    readingTime: '2 min read',
    featured: false,
    showOnHome: false,
    seoTitle: null,
    seoDescription: null,
    status: 'DRAFT',
    publishedAt: null,
    createdAt: '2025-05-06T02:20:00.000Z',
    updatedAt: '2025-05-12T06:05:00.000Z',
  },
  {
    id: 'nws-5',
    slug: 'digital-twin-pilot-jangkrik',
    title: 'Digital twin pilot begins on the Jangkrik FPU',
    excerpt: 'A twelve-month pilot will model equipment health against live process data.',
    category: 'Technology',
    entityCode: 'SMB',
    thumbnailUrl: null,
    coverUrl: null,
    pdfUrl: null,
    thumbnailAlt: null,
    coverAlt: null,
    coverCaption: null,
    coverCredit: null,
    content: [paragraph('The pilot pairs process historians with a vendor-supplied simulation model.')],
    gallery: null,
    tags: ['Technology', 'Digital'],
    authorName: 'Rizky Nugroho',
    authorRole: 'Corporate Communications',
    readingTime: '5 min read',
    featured: false,
    showOnHome: false,
    seoTitle: null,
    seoDescription: null,
    status: 'DRAFT',
    publishedAt: null,
    createdAt: '2025-05-15T01:10:00.000Z',
    updatedAt: '2025-05-19T09:35:00.000Z',
  },
  {
    id: 'nws-6',
    slug: 'community-programme-kutai-kartanegara',
    title: 'Community programme expands in Kutai Kartanegara',
    excerpt: 'Scholarships and a clean-water scheme reach four more villages this year.',
    category: 'People',
    entityCode: 'SKT',
    thumbnailUrl: null,
    coverUrl: null,
    pdfUrl: null,
    thumbnailAlt: null,
    coverAlt: null,
    coverCaption: null,
    coverCredit: null,
    content: [paragraph('The programme is delivered with the district administration and two local foundations.')],
    gallery: null,
    tags: ['Community', 'People'],
    authorName: 'Lina Kusuma',
    authorRole: 'Legal & Compliance',
    readingTime: '3 min read',
    featured: false,
    showOnHome: false,
    seoTitle: null,
    seoDescription: null,
    status: 'ARCHIVED',
    publishedAt: '2024-11-08T04:00:00.000Z',
    createdAt: '2024-11-04T03:15:00.000Z',
    updatedAt: '2025-01-22T05:40:00.000Z',
  },
];

const attachments: Record<string, NewsletterAttachment[]> = {
  'nws-1': [
    { id: 'att-1', title: 'Merakes East fact sheet', type: 'PDF', size: '1.2 MB', url: '#' },
    { id: 'att-2', title: 'First gas press release', type: 'PDF', size: '480 KB', url: '#' },
  ],
};

/* -------------------------------------------------------------------- Media */

let media: MediaAsset[] = [
  {
    id: 'med-1',
    filename: 'jangkrik-fpu-aerial.jpg',
    originalName: 'jangkrik-fpu-aerial.jpg',
    mimeType: 'image/jpeg',
    size: 4_404_019,
    url: 'https://picsum.photos/seed/jangkrik/1200/800',
    thumbnailUrl: 'https://picsum.photos/seed/jangkrik/320/240',
    width: 1200,
    height: 800,
    alt: 'Aerial view of the Jangkrik FPU',
    caption: null,
    folderId: null,
    createdAt: '2025-02-18T02:00:00.000Z',
  },
  {
    id: 'med-2',
    filename: 'hse-week-opening.jpg',
    originalName: 'hse-week-opening.jpg',
    mimeType: 'image/jpeg',
    size: 2_105_344,
    url: 'https://picsum.photos/seed/hseweek/1200/800',
    thumbnailUrl: 'https://picsum.photos/seed/hseweek/320/240',
    width: 1200,
    height: 800,
    alt: 'HSE Week opening ceremony',
    caption: null,
    folderId: null,
    createdAt: '2025-03-13T01:30:00.000Z',
  },
  {
    id: 'med-3',
    filename: 'merakes-east-schematic.png',
    originalName: 'merakes-east-schematic.png',
    mimeType: 'image/png',
    size: 1_992_294,
    url: 'https://picsum.photos/seed/merakes/1200/800',
    thumbnailUrl: 'https://picsum.photos/seed/merakes/320/240',
    width: 1200,
    height: 800,
    alt: 'Merakes East tie-in schematic',
    caption: null,
    folderId: null,
    createdAt: '2025-04-24T06:10:00.000Z',
  },
  {
    id: 'med-4',
    filename: 'sustainability-report-2024.pdf',
    originalName: 'sustainability-report-2024.pdf',
    mimeType: 'application/pdf',
    size: 8_808_038,
    url: '#',
    thumbnailUrl: null,
    width: null,
    height: null,
    alt: null,
    caption: null,
    folderId: null,
    createdAt: '2025-04-30T03:00:00.000Z',
  },
];

/* ----------------------------------------------------------------- Plumbing */

type Params = Record<string, unknown>;

const num = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** Filters, sorts and slices a collection the way the real list endpoints do. */
function paginate<T extends Record<string, unknown>>(
  rows: T[],
  params: Params,
  searchable: (keyof T)[],
): ApiEnvelope<T[]> {
  const page = num(params['page'], 1);
  const limit = num(params['limit'], 10);
  const search = String(params['search'] ?? '').toLowerCase();

  let matched = rows;

  if (search) {
    matched = matched.filter((row) =>
      searchable.some((key) => String(row[key] ?? '').toLowerCase().includes(search)),
    );
  }

  for (const key of ['status', 'category', 'entityCode', 'kind'] as const) {
    const value = params[key];
    if (value === undefined || value === '' || value === null) continue;
    matched = matched.filter((row) => row[key] === value);
  }

  if (params['featured'] !== undefined) {
    matched = matched.filter((row) => Boolean(row['featured']) === Boolean(params['featured']));
  }

  if (params['tag']) {
    const tag = String(params['tag']);
    matched = matched.filter((row) => (row['tags'] as string[] | undefined)?.includes(tag));
  }

  const sortBy = String(params['sortBy'] ?? 'updatedAt');
  const direction = params['sortOrder'] === 'asc' ? 1 : -1;

  matched = [...matched].sort((a, b) => {
    const left = String(a[sortBy] ?? '');
    const right = String(b[sortBy] ?? '');
    return left === right ? 0 : (left < right ? -1 : 1) * direction;
  });

  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return envelope(matched.slice(start, start + limit), 'OK', {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}

const notFound = (what: string) => new ApiRequestError(`${what} not found`, 404, 'NOT_FOUND');

function requireSession(): void {
  if (!getRefreshToken()) {
    throw new ApiRequestError('Not authenticated', 401, 'UNAUTHENTICATED');
  }
}

/** `/admin/newsletters/nws-1/attachments` → ['admin', 'newsletters', 'nws-1', 'attachments'] */
const segments = (url: string) => url.split('?')[0]!.split('/').filter(Boolean);

/* ------------------------------------------------------------------- Router */

export type MockMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export async function mockRequest<T>(
  method: MockMethod,
  url: string,
  body?: unknown,
  params: Params = {},
): Promise<ApiEnvelope<T>> {
  await delay();

  const path = segments(url);
  const payload = (body ?? {}) as Record<string, unknown>;
  const result = route(method, path, payload, params);

  return result as ApiEnvelope<T>;
}

function route(
  method: MockMethod,
  path: string[],
  payload: Record<string, unknown>,
  params: Params,
): ApiEnvelope<unknown> {
  const [root, resource, id, sub, subId] = path;

  /* ------------------------------------------------------------------ Auth */

  if (root === 'auth') {
    switch (resource) {
      case 'login': {
        // Any credentials are accepted while the API is mocked; only the shape matters.
        if (!payload['email'] || !payload['password']) {
          throw new ApiRequestError('Check the highlighted fields', 422, 'VALIDATION_ERROR', [
            ...(payload['email'] ? [] : [{ field: 'email', message: 'Email is required' }]),
            ...(payload['password'] ? [] : [{ field: 'password', message: 'Password is required' }]),
          ]);
        }

        currentUser = { ...MOCK_USER, email: String(payload['email']) };

        return envelope<LoginResponse>({
          user: currentUser,
          accessToken: `mock-access-${idCounter}`,
          refreshToken: `mock-refresh-${idCounter}`,
        });
      }

      case 'logout':
        return envelope(null);

      case 'refresh':
        return envelope({ accessToken: `mock-access-${++idCounter}`, refreshToken: `mock-refresh-${idCounter}` });

      case 'me':
        requireSession();
        return envelope(currentUser);

      case 'change-password':
      case 'reset-password':
        return envelope(null);

      case 'forgot-password':
        return envelope({ devToken: 'mock-reset-token' });
    }
  }

  if (root !== 'admin') throw notFound(`Route /${path.join('/')}`);

  /* ------------------------------------------------------------------ Users */

  if (resource === 'users' && id === 'me' && method === 'PATCH') {
    currentUser = { ...currentUser, ...(payload as Partial<CurrentUser>) };
    return envelope(currentUser);
  }

  /* ----------------------------------------------------------- Newsletters */

  if (resource === 'newsletters') {
    if (!id) {
      if (method === 'GET') return paginate(newsletters as unknown as Record<string, unknown>[], params, ['title', 'excerpt', 'slug']);

      if (method === 'POST') {
        const now = new Date().toISOString();
        const created: Newsletter = {
          id: nextId('nws'),
          slug: String(payload['slug'] ?? slugify(String(payload['title'] ?? 'untitled'))),
          title: String(payload['title'] ?? 'Untitled'),
          excerpt: null,
          category: 'Corporate',
          entityCode: null,
          thumbnailUrl: null,
          coverUrl: null,
          pdfUrl: null,
          thumbnailAlt: null,
          coverAlt: null,
          coverCaption: null,
          coverCredit: null,
          content: null,
          gallery: null,
          tags: [],
          authorName: currentUser.name,
          authorRole: currentUser.position,
          readingTime: null,
          featured: false,
          showOnHome: false,
          seoTitle: null,
          seoDescription: null,
          status: 'DRAFT',
          publishedAt: null,
          createdAt: now,
          updatedAt: now,
          ...(payload as Partial<Newsletter>),
        };

        newsletters = [created, ...newsletters];
        return envelope(created, 'Article created');
      }
    }

    if (id) {
      const index = newsletters.findIndex((row) => row.id === id);
      if (index === -1) throw notFound('Article');
      const article = newsletters[index]!;

      /* Attachments */
      if (sub === 'attachments') {
        const list = attachments[id] ?? [];

        if (method === 'GET') return envelope(list);

        if (method === 'POST') {
          const attachment: NewsletterAttachment = { id: nextId('att'), ...(payload as Omit<NewsletterAttachment, 'id'>) };
          attachments[id] = [...list, attachment];
          return envelope(attachment, 'Attachment added');
        }

        if (method === 'DELETE') {
          attachments[id] = list.filter((row) => row.id !== subId);
          return envelope(null, 'Attachment removed');
        }
      }

      if (method === 'GET') return envelope({ ...article, attachments: attachments[id] ?? [] });

      if (method === 'PATCH') {
        const patch =
          sub === 'status'
            ? { status: payload['status'] as Newsletter['status'] }
            : (payload as Partial<Newsletter>);

        const updated: Newsletter = {
          ...article,
          ...patch,
          updatedAt: new Date().toISOString(),
          publishedAt:
            patch.status === 'PUBLISHED' && !article.publishedAt ? new Date().toISOString() : article.publishedAt,
        };

        newsletters = newsletters.map((row) => (row.id === id ? updated : row));
        return envelope(updated, sub === 'status' ? 'Status updated' : 'Article saved');
      }

      if (method === 'DELETE') {
        newsletters = newsletters.filter((row) => row.id !== id);
        return envelope(null, 'Article deleted');
      }
    }
  }

  /* ----------------------------------------------------------------- Media */

  if (resource === 'media') {
    if (method === 'GET') {
      const kind = params['kind'];
      const rows = kind
        ? media.filter((asset) =>
            kind === 'image' ? asset.mimeType.startsWith('image/') : !asset.mimeType.startsWith('image/'),
          )
        : media;

      return paginate(rows as unknown as Record<string, unknown>[], { ...params, kind: undefined }, [
        'originalName',
        'alt',
      ]);
    }

    if (method === 'DELETE' && id) {
      media = media.filter((asset) => asset.id !== id);
      return envelope(null, 'File deleted');
    }
  }

  /* Modules whose CMS screens are still stubs — the dashboard only reads the count. */
  if (['leadership', 'galleries', 'production', 'resources'].includes(resource ?? '') && method === 'GET') {
    const totals: Record<string, number> = { leadership: 5, galleries: 5, production: 6, resources: 5 };
    const total = totals[resource!] ?? 0;

    return envelope([], 'OK', {
      pagination: { page: 1, limit: 1, total, totalPages: total, hasNextPage: total > 1, hasPreviousPage: false },
    });
  }

  throw notFound(`Route ${method} /${path.join('/')}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Upload counterpart. `media.service` posts multipart through axios directly rather
 * than the JSON helpers, so it calls this instead of `mockRequest`. Object URLs keep
 * the just-uploaded file previewable for the rest of the session.
 */
export async function mockUpload(files: File[], meta?: { alt?: string; folderId?: string }): Promise<MediaAsset[]> {
  await delay();

  const uploaded = files.map<MediaAsset>((file) => ({
    id: nextId('med'),
    filename: file.name,
    originalName: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    url: URL.createObjectURL(file),
    thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    width: null,
    height: null,
    alt: meta?.alt ?? null,
    caption: null,
    folderId: meta?.folderId ?? null,
    createdAt: new Date().toISOString(),
  }));

  media = [...uploaded, ...media];
  return uploaded;
}
