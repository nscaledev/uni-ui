export interface Stats {
	total: number;
	provisioned: number;
	needsAttention: number;
	errorCount: number;
	stuckDeprovisioning: number;
	recent: number;
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

function isStuckDeprovisioning(r: StatResource, now: number): boolean {
	return (
		r.metadata.provisioningStatus === 'deprovisioning' &&
		r.metadata.deletionTime !== undefined &&
		now - r.metadata.deletionTime.getTime() > STUCK_DEPROVISIONING_MS
	);
}

export function computeStats(resources: Array<StatResource>): Stats {
	const now = Date.now();
	const cutoff = now - RECENT_WINDOW_MS;

	const errorCount = resources.filter((r) => r.metadata.provisioningStatus === 'error').length;
	const stuckDeprovisioning = resources.filter((r) => isStuckDeprovisioning(r, now)).length;

	return {
		total: resources.length,
		provisioned: resources.filter((r) => r.metadata.provisioningStatus === 'provisioned').length,
		needsAttention: errorCount + stuckDeprovisioning,
		errorCount,
		stuckDeprovisioning,
		recent: resources.filter((r) => r.metadata.creationTime.getTime() > cutoff).length
	};
}
