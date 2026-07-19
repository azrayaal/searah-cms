import { useState } from 'react';

import { FileText, Plus, Trash2 } from 'lucide-react';

import { MediaPicker } from '@/components/media/MediaPicker';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/Feedback';
import { useAddAttachment, useNewsletterAttachments, useRemoveAttachment } from '@/hooks/useNewsletters';
import { fileKind, formatBytes } from '@/services/media.service';

/**
 * Downloadable files hanging off an article.
 *
 * Unlike the rest of the form, these write immediately rather than on submit: they are
 * a relation with their own endpoints, and buffering them until save would mean
 * inventing a diffing step to work out which rows to create and which to delete.
 *
 * Each attachment's title, type and size are derived from the chosen file, so the
 * displayed size can never drift from what a reader actually downloads.
 */
export function AttachmentsPanel({ newsletterId }: { newsletterId: string }) {
  const [picking, setPicking] = useState(false);

  const { data: attachments, isPending, isError, error, refetch } = useNewsletterAttachments(newsletterId);
  const add = useAddAttachment(newsletterId);
  const remove = useRemoveAttachment(newsletterId);

  if (isPending) return <LoadingState label="Loading attachments…" />;

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Could not load attachments'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {attachments.length === 0 ? (
        <p className="rounded-card border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
          No attachments yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center gap-3 rounded-card border border-gray-200 px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">{attachment.title}</p>
                <p className="text-xs text-gray-500">
                  {attachment.type} · {attachment.size}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={`Remove ${attachment.title}`}
                isLoading={remove.isPending && remove.variables === attachment.id}
                onClick={() => remove.mutate(attachment.id)}
              >
                <Trash2 className="h-4 w-4 text-burgundy" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {(add.isError || remove.isError) && (
        <p role="alert" className="text-sm text-burgundy">
          {(add.error ?? remove.error) instanceof Error
            ? (add.error ?? remove.error)!.message
            : 'Could not update attachments'}
        </p>
      )}

      <div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          isLoading={add.isPending}
          onClick={() => setPicking(true)}
          leadingIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          Add attachment
        </Button>
      </div>

      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        kind="document"
        title="Attach a file"
        onSelect={(asset) =>
          add.mutate({
            title: asset.caption ?? asset.originalName,
            type: fileKind(asset),
            size: formatBytes(asset.size),
            url: asset.url,
          })
        }
      />
    </div>
  );
}
