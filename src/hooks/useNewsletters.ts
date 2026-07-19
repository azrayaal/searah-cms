import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import {
  newsletterService,
  type AttachmentPayload,
  type NewsletterListParams,
  type NewsletterPayload,
} from '@/services/newsletter.service';
import type { ContentStatus } from '@/types/api';

export function useNewsletterList(params: NewsletterListParams) {
  return useQuery({
    queryKey: queryKeys.newsletters.list(params),
    queryFn: () => newsletterService.list(params),
    // Keeps the previous page visible while the next one loads, so the table does
    // not collapse to a spinner on every page change.
    placeholderData: (previous) => previous,
  });
}

export function useNewsletter(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.newsletters.detail(id ?? ''),
    queryFn: () => newsletterService.detail(id as string),
    enabled: Boolean(id),
  });
}

/** Invalidates every newsletter query — lists, filters and details alike. */
function useInvalidateNewsletters() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.newsletters.all });
}

export function useCreateNewsletter() {
  const invalidate = useInvalidateNewsletters();

  return useMutation({
    mutationFn: (payload: NewsletterPayload) => newsletterService.create(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateNewsletter(id: string) {
  const invalidate = useInvalidateNewsletters();

  return useMutation({
    mutationFn: (payload: Partial<NewsletterPayload>) => newsletterService.update(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteNewsletter() {
  const invalidate = useInvalidateNewsletters();

  return useMutation({
    mutationFn: (id: string) => newsletterService.remove(id),
    onSuccess: invalidate,
  });
}

export function useSetNewsletterStatus() {
  const invalidate = useInvalidateNewsletters();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatus }) =>
      newsletterService.setStatus(id, status),
    onSuccess: invalidate,
  });
}

/* ---------------------------------------------------------------- Attachments */

export function useNewsletterAttachments(id: string) {
  return useQuery({
    queryKey: queryKeys.newsletters.attachments(id),
    queryFn: () => newsletterService.listAttachments(id),
    enabled: Boolean(id),
  });
}

/**
 * Attachment writes invalidate the article too, not only the attachment list: the
 * detail endpoint includes `attachments`, so leaving it cached would show a stale
 * count the moment the editor navigates back to the list.
 */
function useInvalidateAttachments(id: string) {
  const client = useQueryClient();

  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.newsletters.attachments(id) });
    void client.invalidateQueries({ queryKey: queryKeys.newsletters.detail(id) });
  };
}

export function useAddAttachment(id: string) {
  const invalidate = useInvalidateAttachments(id);

  return useMutation({
    mutationFn: (payload: AttachmentPayload) => newsletterService.addAttachment(id, payload),
    onSuccess: invalidate,
  });
}

export function useRemoveAttachment(id: string) {
  const invalidate = useInvalidateAttachments(id);

  return useMutation({
    mutationFn: (attachmentId: string) => newsletterService.removeAttachment(id, attachmentId),
    onSuccess: invalidate,
  });
}
