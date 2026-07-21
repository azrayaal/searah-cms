import { apiDelete, apiGetEnvelope } from '@/services/apiClient';
import { mockUpload } from '@/services/mock/mockApi';
import type { ApiEnvelope, ListParams, MediaAsset } from '@/types/api';

export interface MediaListParams extends ListParams {
  folderId?: string;
  /** Coarse bucket the picker filters by, matching the backend's `kind` query. */
  kind?: 'image' | 'document';
}

const BASE = '/admin/media';

export const mediaService = {
  list: (params: MediaListParams): Promise<ApiEnvelope<MediaAsset[]>> =>
    apiGetEnvelope<MediaAsset[]>(BASE, params),

  /**
   * Upload goes through axios directly rather than the `apiPost` helper: the helper
   * sends JSON, and multipart needs the browser to set its own boundary header.
   * Passing FormData and leaving Content-Type unset is what makes that happen.
   */
  upload: async (files: File[], meta?: { alt?: string; folderId?: string }): Promise<MediaAsset[]> => {
    // DUMMY MODE — see the note in `apiClient`. Uncomment the block below and drop the
    // `mockUpload` line to post to the real endpoint again.
    // const form = new FormData();
    // for (const file of files) form.append('files', file);
    // if (meta?.alt) form.append('alt', meta.alt);
    // if (meta?.folderId) form.append('folderId', meta.folderId);
    //
    // const response = await apiClient.post<ApiEnvelope<MediaAsset[]>>(`${BASE}/upload`, form);
    // return response.data.data;
    return mockUpload(files, meta);
  },

  remove: (id: string) => apiDelete(`${BASE}/${id}`),
};

/** Bytes to something an editor can read at a glance, for the attachment `size` field. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The extension, uppercased — what the article page prints on a download chip. */
export function fileKind(asset: Pick<MediaAsset, 'originalName' | 'mimeType'>): string {
  const extension = asset.originalName.split('.').pop();
  if (extension && extension.length <= 5) return extension.toUpperCase();

  return asset.mimeType.split('/').pop()?.toUpperCase() ?? 'FILE';
}
