import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

// Work item images are served through the authenticated GET /work-items/:id/image
// endpoint, not a public static URL — a plain <img>/<Image> src can't attach the
// Bearer token that route requires, so this fetches the image as a blob via axios
// (which does attach it) and exposes it as an object URL instead.
export function useWorkItemImage(workItemId: string | null, hasImage: boolean) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!workItemId || !hasImage) {
      setUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    apiClient
      .get(`/work-items/${workItemId}/image`, { responseType: 'blob' })
      .then((response) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(response.data as Blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [workItemId, hasImage]);

  return url;
}
