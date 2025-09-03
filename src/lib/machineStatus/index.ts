import * as Compute from '$lib/openapi/compute';

export function statusIcon(s: Compute.ComputeClusterMachineStatusStatusEnum): string {
	switch (s) {
		case Compute.ComputeClusterMachineStatusStatusEnum.Pending:
			return 'mdi:clock-outline';
		case Compute.ComputeClusterMachineStatusStatusEnum.Running:
			return 'mdi:tick-circle-outline';
		case Compute.ComputeClusterMachineStatusStatusEnum.Stopping:
			return 'mdi:pause-circle-outline';
		case Compute.ComputeClusterMachineStatusStatusEnum.Stopped:
			return 'mdi:stop-circle-outline';
	}
	return 'svg-spinners:ring-resize';
}
