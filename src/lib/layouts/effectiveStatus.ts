import * as Identity from '$lib/openapi/identity';
import * as Compute from '$lib/openapi/compute';
import * as Kubernetes from '$lib/openapi/kubernetes';

export type ChipClass = 'ok' | 'warn' | 'err' | 'info' | 'muted';

export interface OperationalStatus {
	label: string;
	chipClass: ChipClass;
}

/**
 * Resolve the single effective status chip for a resource card.
 *
 * Priority:
 *   unknown / undefined  → null (suppress chip)
 *   error                → error chip
 *   provisioning states  → provisioning lifecycle chip
 *   provisioned          → operationalStatus if provided, else "provisioned"
 */
export function resolveChip(
	provisioningStatus: Identity.ResourceProvisioningStatus | undefined,
	operationalStatus: OperationalStatus | null | undefined
): { label: string; chipClass: ChipClass } | null {
	switch (provisioningStatus) {
		case Identity.ResourceProvisioningStatus.Unknown:
		case undefined:
			return null;
		case Identity.ResourceProvisioningStatus.Error:
			return { label: 'error', chipClass: 'err' };
		case Identity.ResourceProvisioningStatus.Provisioning:
			return { label: 'provisioning', chipClass: 'info' };
		case Identity.ResourceProvisioningStatus.Pending:
			return { label: 'pending', chipClass: 'info' };
		case Identity.ResourceProvisioningStatus.Deprovisioning:
			return { label: 'deprovisioning', chipClass: 'warn' };
		case Identity.ResourceProvisioningStatus.Provisioned:
			return operationalStatus ?? { label: 'provisioned', chipClass: 'ok' };
		default:
			return { label: provisioningStatus, chipClass: 'muted' };
	}
}

/** Instances: power-state → operational status */
export function fromPowerState(
	phase: Compute.InstanceLifecyclePhase | undefined
): OperationalStatus | null {
	switch (phase) {
		case Compute.InstanceLifecyclePhase.Running:
			return { label: 'running', chipClass: 'ok' };
		case Compute.InstanceLifecyclePhase.Stopped:
			return { label: 'stopped', chipClass: 'muted' };
		case Compute.InstanceLifecyclePhase.Stopping:
			return { label: 'stopping', chipClass: 'warn' };
		case Compute.InstanceLifecyclePhase.Pending:
			return { label: 'pending', chipClass: 'info' };
		default:
			return null;
	}
}

/** Kubernetes clusters: health → operational status */
export function fromHealthStatus(
	health: Kubernetes.ResourceHealthStatus | undefined
): OperationalStatus | null {
	switch (health) {
		case Kubernetes.ResourceHealthStatus.Healthy:
			return { label: 'healthy', chipClass: 'ok' };
		case Kubernetes.ResourceHealthStatus.Degraded:
			return { label: 'degraded', chipClass: 'warn' };
		case Kubernetes.ResourceHealthStatus.Error:
			return { label: 'error', chipClass: 'err' };
		default:
			return null;
	}
}

/** Users: account state → operational status */
export function fromUserState(state: Identity.UserState | undefined): OperationalStatus | null {
	switch (state) {
		case Identity.UserState.Active:
			return { label: 'active', chipClass: 'ok' };
		case Identity.UserState.Pending:
			return { label: 'pending', chipClass: 'info' };
		case Identity.UserState.Suspended:
			return { label: 'suspended', chipClass: 'err' };
		default:
			return null;
	}
}
