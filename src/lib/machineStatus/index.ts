import * as Compute from '$lib/openapi/compute';

export function statusColor(s: Compute.InstanceLifecyclePhase): string {
	switch (s) {
		case Compute.InstanceLifecyclePhase.Running:
			return 'text-success-500';
		case Compute.InstanceLifecyclePhase.Stopping:
		case Compute.InstanceLifecyclePhase.Stopped:
			return 'text-warning-500';
	}
	return 'dark:text-surface-500';
}

export function statusIcon(s: Compute.InstanceLifecyclePhase): string {
	switch (s) {
		case Compute.InstanceLifecyclePhase.Pending:
			return 'mdi:clock-outline';
		case Compute.InstanceLifecyclePhase.Running:
			return 'mdi:tick-circle-outline';
		case Compute.InstanceLifecyclePhase.Stopping:
			return 'mdi:pause-circle-outline';
		case Compute.InstanceLifecyclePhase.Stopped:
			return 'mdi:stop-circle-outline';
	}
	return 'svg-spinners:ring-resize';
}

export function canStopOrStart(s: Compute.InstanceLifecyclePhase): boolean {
	switch (s) {
		case Compute.InstanceLifecyclePhase.Running:
		case Compute.InstanceLifecyclePhase.Stopped:
			return true;
	}
	return false;
}

export function canReboot(s: Compute.InstanceLifecyclePhase): boolean {
	return s === Compute.InstanceLifecyclePhase.Running;
}
