import * as Identity from '#lib/openapi/identity/index.ts';

export function statusColor(s: Identity.ResourceHealthStatus): string {
	switch (s) {
		case Identity.ResourceHealthStatus.Healthy:
			return 'text-success-500';
		case Identity.ResourceHealthStatus.Degraded:
			return 'text-warning-500';
		case Identity.ResourceHealthStatus.Error:
			return 'text-error-500';
	}
	return 'dark:text-surface-500';
}

export function statusIcon(s: Identity.ResourceHealthStatus): string {
	switch (s) {
		case Identity.ResourceHealthStatus.Healthy:
			return 'mdi:heart-outline';
		case Identity.ResourceHealthStatus.Degraded:
			return 'mdi:heart-broken-outline';
		case Identity.ResourceHealthStatus.Error:
			return 'mdi:heart-broken-outline';
	}
	return 'mdi:heart-broken-outline';
}

export function color(meta: Identity.ResourceReadMetadata): string {
	return statusColor(meta.healthStatus);
}

export function icon(meta: Identity.ResourceReadMetadata): string {
	return statusIcon(meta.healthStatus);
}
