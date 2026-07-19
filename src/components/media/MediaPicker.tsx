import { useEffect, useRef, useState } from 'react';

import { FileText, ImageOff, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, SkeletonRows } from '@/components/ui/Feedback';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { useMediaList, useUploadMedia } from '@/hooks/useMedia';
import { cn } from '@/lib/cn';
import { formatBytes } from '@/services/media.service';
import type { MediaAsset } from '@/types/api';

export interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  kind?: 'image' | 'document';
  title?: string;
}

/**
 * The media library as a chooser.
 *
 * Replaces the raw URL text inputs the form used to carry. Typing a path by hand is
 * how a live article ends up pointing at a file that was never uploaded — the picker
 * can only return assets that actually exist.
 *
 * Upload happens in place rather than on a separate screen: an editor who discovers
 * mid-article that the image is not in the library should not have to abandon the form.
 */
export function MediaPicker({ open, onClose, onSelect, kind = 'image', title }: MediaPickerProps) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = useUploadMedia();

  // Debounced so typing a filename does not fire a request per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  // A picker reopened later should not still be showing the last search.
  useEffect(() => {
    if (!open) {
      setSearch('');
      setDebounced('');
      setPage(1);
    }
  }, [open]);

  const { data, isPending, isError, error, refetch } = useMediaList(
    { page, limit: 24, kind, ...(debounced ? { search: debounced } : {}) },
    open,
  );

  const assets = data?.data ?? [];
  const pagination = data?.meta.pagination;

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const uploaded = await upload.mutateAsync({ files: Array.from(files) });
      // Selecting the freshly uploaded file is almost always the intent — the editor
      // opened the picker to use it, not to admire it in the grid.
      const first = uploaded[0];
      if (first) {
        onSelect(first);
        onClose();
      }
    } finally {
      // Clears the input so re-picking the same file still fires a change event.
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={title ?? (kind === 'image' ? 'Choose an image' : 'Choose a file')}
      description="Select from the media library, or upload a new file."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Search"
            placeholder="Filename, alt text or caption"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[16rem] flex-1"
          />

          <input
            ref={fileInput}
            type="file"
            multiple
            accept={kind === 'image' ? 'image/*' : undefined}
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files)}
          />

          <Button
            type="button"
            variant="secondary"
            isLoading={upload.isPending}
            onClick={() => fileInput.current?.click()}
            leadingIcon={<Upload className="h-4 w-4" aria-hidden="true" />}
          >
            Upload
          </Button>
        </div>

        {upload.isError && (
          <p role="alert" className="text-sm text-burgundy">
            {upload.error instanceof Error ? upload.error.message : 'Upload failed'}
          </p>
        )}

        {isPending && <SkeletonRows rows={4} columns={4} />}

        {isError && (
          <ErrorState
            message={error instanceof Error ? error.message : 'Could not load the media library'}
            onRetry={refetch}
          />
        )}

        {!isPending && !isError && assets.length === 0 && (
          <EmptyState
            title="Nothing here yet"
            description={debounced ? 'No files match that search.' : 'Upload a file to get started.'}
            icon={<ImageOff className="h-6 w-6" aria-hidden="true" />}
          />
        )}

        {!isPending && !isError && assets.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {assets.map((asset) => (
              <li key={asset.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="group w-full overflow-hidden rounded-card border border-gray-200 text-left
                             transition-colors hover:border-primary focus:border-primary focus:outline-none"
                >
                  <AssetThumbnail asset={asset} />

                  <span className="block truncate px-2 pt-2 text-xs font-medium text-gray-700">
                    {asset.originalName}
                  </span>
                  <span className="block px-2 pb-2 text-xs text-gray-400">{formatBytes(asset.size)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Pagination meta={pagination} onPageChange={setPage} />
        )}
      </div>
    </Modal>
  );
}

function AssetThumbnail({ asset, className }: { asset: MediaAsset; className?: string }) {
  const isImage = asset.mimeType.startsWith('image/');

  if (!isImage) {
    return (
      <span className={cn('flex h-24 items-center justify-center bg-surface-page', className)}>
        <FileText className="h-6 w-6 text-gray-400" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={asset.thumbnailUrl ?? asset.url}
      alt={asset.alt ?? ''}
      loading="lazy"
      className={cn('h-24 w-full bg-surface-page object-cover', className)}
    />
  );
}

export interface MediaFieldProps {
  label: string;
  hint?: string;
  error?: string;
  value: string;
  onChange: (url: string) => void;
  kind?: 'image' | 'document';
}

/**
 * A single media reference: a preview, a Browse button, and a Clear.
 *
 * The stored value is still a plain URL string — the picker changes how it is chosen,
 * not what the API receives, so nothing downstream had to change to accommodate it.
 */
export function MediaField({ label, hint, error, value, onChange, kind = 'image' }: MediaFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>

      <div className="flex items-center gap-3">
        <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-card border border-gray-200 bg-surface-page">
          {value ? (
            kind === 'image' ? (
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
            )
          ) : (
            <ImageOff className="h-5 w-5 text-gray-300" aria-hidden="true" />
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="truncate text-xs text-gray-500">{value || 'Nothing selected'}</p>

          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
              {value ? 'Replace' : 'Browse'}
            </Button>

            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange('')}
                leadingIcon={<X className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-burgundy">
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-gray-500">{hint}</p>
      )}

      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(asset) => onChange(asset.url)} kind={kind} />
    </div>
  );
}
