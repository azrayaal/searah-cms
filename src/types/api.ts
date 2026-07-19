/** Mirrors the backend's response envelope. Every endpoint returns this shape. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  code?: string;
  errors?: FieldError[];
  [key: string]: unknown;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ Auth */

export interface Role {
  id: string;
  key: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  name: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  position: string | null;
  avatarUrl: string | null;
  lastLoginAt?: string | null;
  role: Role;
  permissions: string[];
}

export interface LoginResponse {
  user: CurrentUser;
  accessToken: string;
  refreshToken: string;
}

/* ------------------------------------------------------------- Content */

export interface Newsletter {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  entityCode: string | null;
  thumbnailUrl: string | null;
  coverUrl: string | null;
  pdfUrl: string | null;
  content: ContentBlock[] | null;
  gallery: MediaRef[] | null;
  tags: string[];
  authorName: string | null;
  authorRole: string | null;
  readingTime: string | null;
  featured: boolean;
  showOnHome: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments?: NewsletterAttachment[];
}

export interface NewsletterAttachment {
  id: string;
  title: string;
  type: string;
  size: string;
  url: string;
}

export interface MediaRef {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; media: MediaRef }
  | { type: 'stat'; items: { label: string; value: string }[] };

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  folderId: string | null;
  createdAt: string;
}
