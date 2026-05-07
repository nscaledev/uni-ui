export interface Stats {
	total: number;
	provisioned: number;
	needsAttention: number;
	recent: number;
	stuckDeprovisioning: number;
}

interface StatResource {
	metadata: {
		provisioningStatus: string;
		creationTime: Date;
		deletionTime?: Date;
	};
}

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const STUCK_DEPROVISIONING_MS = 60 * 60 * 1000; // 1 hour

export function computeStats(resources: Array<StatResource>): Stats {
	const now = Date.now();
	const cutoff = now - RECENT_WINDOW_MS;

	return {
		total: resources.length,
		provisioned: resources.filter((r) => r.metadata.provisioningStatus === 'provisioned').length,
		needsAttention: resources.filter((r) => r.metadata.provisioningStatus === 'error').length,
		recent: resources.filter((r) => r.metadata.creationTime.getTime() > cutoff).length,
		stuckDeprovisioning: resources.filter(
			(r) =>
				r.metadata.provisioningStatus === 'deprovisioning' &&
				r.metadata.deletionTime !== undefined &&
				now - r.metadata.deletionTime.getTime() > STUCK_DEPROVISIONING_MS
		).length
	};
}
