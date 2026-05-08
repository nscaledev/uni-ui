import * as Identity from '$lib/openapi/identity';

export function statusColor(s: Identity.ResourceProvisioningStatus): string {
	switch (s) {
		case Identity.ResourceProvisioningStatus.Provisioned:
			return 'text-success-500';
		case Identity.ResourceProvisioningStatus.Error:
			return 'text-error-500';
		case Identity.ResourceProvisioningStatus.Pending:
			return 'text-warning-500';
		case Identity.ResourceProvisioningStatus.Unknown:
			return 'text-warning-500';
	}
	return 'dark:text-surface-500';
}

export function statusIcon(s: Identity.ResourceProvisioningStatus): string {
	switch (s) {
		case Identity.ResourceProvisioningStatus.Provisioned:
			return 'mdi:tick-circle-outline';
		case Identity.ResourceProvisioningStatus.Error:
			return 'mdi:error-outline';
		case Identity.ResourceProvisioningStatus.Pending:
			return 'mdi:question-mark';
		case Identity.ResourceProvisioningStatus.Unknown:
			return 'mdi:question-mark';
	}
	return 'svg-spinners:ring-resize';
}

export function color(metadata: Identity.ResourceReadMetadata): string {
	return statusColor(metadata.provisioningStatus);
}

export function icon(metadata: Identity.ResourceReadMetadata): string {
	return statusIcon(metadata.provisioningStatus);
}
