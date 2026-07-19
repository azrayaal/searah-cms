import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryClient';
import { mediaService, type MediaListParams } from '@/services/media.service';

export function useMediaList(params: MediaListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.media.list(params),
    queryFn: () => mediaService.list(params),
    // Keeps the previous page on screen while the next loads, so paging the picker
    // does not blank the grid and shift the modal's height.
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { files: File[]; alt?: string }) =>
      mediaService.upload(input.files, input.alt ? { alt: input.alt } : undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.media.all }),
  });
}
