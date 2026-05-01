export interface Stats {
	total: number;
	provisioned: number;
	needsAttention: number;
	recent: number;
}

interface StatResource {
	metadata: {
		provisioningStatus: string;
		creationTime: Date;
	};
}

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function computeStats(resources: Array<StatResource>): Stats {
	const cutoff = Date.now() - RECENT_WINDOW_MS;

	return {
		total: resources.length,
		provisioned: resources.filter((r) => r.metadata.provisioningStatus === 'provisioned').length,
		needsAttention: resources.filter((r) => r.metadata.provisioningStatus === 'error').length,
		recent: resources.filter((r) => r.metadata.creationTime.getTime() > cutoff).length
	};
}
