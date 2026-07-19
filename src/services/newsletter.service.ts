import { apiDelete, apiGetEnvelope, apiGet, apiPatch, apiPost } from '@/services/apiClient';
import type { ApiEnvelope, ContentStatus, ListParams, Newsletter } from '@/types/api';

export interface NewsletterListParams extends ListParams {
  category?: string;
  entityCode?: string;
  featured?: boolean;
  tag?: string;
}

export interface NewsletterPayload {
  title: string;
  slug?: string;
  excerpt?: string | null;
  category: string;
  entityCode?: string | null;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  pdfUrl?: string | null;
  tags?: string[];
  authorName?: string | null;
  authorRole?: string | null;
  readingTime?: string | null;
  featured?: boolean;
  showOnHome?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: ContentStatus;
}

const BASE = '/admin/newsletters';

export const newsletterService = {
  list: (params: NewsletterListParams): Promise<ApiEnvelope<Newsletter[]>> =>
    apiGetEnvelope<Newsletter[]>(BASE, params),

  detail: (id: string) => apiGet<Newsletter>(`${BASE}/${id}`),

  create: (payload: NewsletterPayload) => apiPost<Newsletter>(BASE, payload),

  update: (id: string, payload: Partial<NewsletterPayload>) => apiPatch<Newsletter>(`${BASE}/${id}`, payload),

  remove: (id: string) => apiDelete(`${BASE}/${id}`),

  /** Publish/unpublish is its own endpoint, gated by `newsletter:publish`. */
  setStatus: (id: string, status: ContentStatus) => apiPatch<Newsletter>(`${BASE}/${id}/status`, { status }),
};

/** Categories the source content already uses. */
export const NEWSLETTER_CATEGORIES = [
  'Corporate',
  'Operations',
  'Sustainability',
  'Technology',
  'People',
  'Safety',
] as const;

export const ENTITY_CODES = [
  { value: '', label: 'Group-wide' },
  { value: 'SKT', label: 'Searah Ketapang (SKT)' },
  { value: 'SMB', label: 'Searah Muara Bakau (SMB)' },
  { value: 'SMY', label: 'Searah Malaysia (SMY)' },
] as const;
