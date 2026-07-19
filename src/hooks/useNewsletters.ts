import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import {
  newsletterService,
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
