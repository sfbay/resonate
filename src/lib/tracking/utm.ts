interface UTMParams {
  campaignId: string;
  unitId: string;
  format: string;
  source?: string;
}

/**
 * Generate a tracked URL with UTM parameters.
 * Wraps the original destination URL with Resonate tracking params.
 */
export function generateTrackedUrl(destinationUrl: string, params: UTMParams): string {
  try {
    const url = new URL(destinationUrl);
    url.searchParams.set('utm_source', 'resonate');
    url.searchParams.set('utm_medium', params.format.replace(/_/g, '-'));
    url.searchParams.set('utm_campaign', params.campaignId);
    url.searchParams.set('utm_content', params.unitId);
    if (params.source) {
      url.searchParams.set('utm_term', params.source);
    }
    return url.toString();
  } catch {
    // If the URL is malformed, return as-is
    return destinationUrl;
  }
}

/**
 * Extract UTM parameters from a tracked URL.
 */
export function parseTrackedUrl(trackedUrl: string): UTMParams | null {
  try {
    const url = new URL(trackedUrl);
    const campaignId = url.searchParams.get('utm_campaign');
    const unitId = url.searchParams.get('utm_content');
    const format = url.searchParams.get('utm_medium');

    if (!campaignId || !unitId || !format) return null;

    return {
      campaignId,
      unitId,
      format: format.replace(/-/g, '_'),
      source: url.searchParams.get('utm_term') || undefined,
    };
  } catch {
    return null;
  }
}
