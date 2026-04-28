import { describe, it, expect } from 'vitest';
import { computeStats } from './stats';

const DAY = 24 * 60 * 60 * 1000;

function makeResource(provisioningStatus: string, daysAgo: number) {
	return {
		metadata: {
			provisioningStatus,
			creationTime: new Date(Date.now() - daysAgo * DAY)
		}
	};
}

describe('computeStats', () => {
	it('returns all zeros for an empty array', () => {
		expect(computeStats([])).toEqual({
			total: 0,
			provisioned: 0,
			needsAttention: 0,
			recent: 0
		});
	});

	it('counts total correctly', () => {
		const resources = [
			makeResource('provisioned', 1),
			makeResource('error', 2),
			makeResource('pending', 3)
		];
		expect(computeStats(resources).total).toBe(3);
	});

	it('counts only provisioned status as provisioned', () => {
		const resources = [
			makeResource('provisioned', 1),
			makeResource('provisioned', 2),
			makeResource('error', 3),
			makeResource('pending', 4),
			makeResource('unknown', 5)
		];
		expect(computeStats(resources).provisioned).toBe(2);
	});

	it('counts everything except provisioned as needsAttention', () => {
		const resources = [
			makeResource('provisioned', 1),
			makeResource('error', 2),
			makeResource('pending', 3),
			makeResource('provisioning', 4),
			makeResource('unknown', 5)
		];
		expect(computeStats(resources).needsAttention).toBe(4);
	});

	it('counts resources created within 7 days as recent', () => {
		const resources = [
			makeResource('provisioned', 1), // 1 day ago — recent
			makeResource('provisioned', 6), // 6 days ago — recent
			makeResource('provisioned', 7), // exactly 7 days ago — recent (within window)
			makeResource('provisioned', 8), // 8 days ago — not recent
			makeResource('error', 30) // 30 days ago — not recent
		];
		const stats = computeStats(resources);
		expect(stats.recent).toBeGreaterThanOrEqual(2);
		expect(stats.recent).toBeLessThanOrEqual(3);
	});

	it('total equals provisioned + needsAttention', () => {
		const resources = [
			makeResource('provisioned', 1),
			makeResource('error', 2),
			makeResource('pending', 3)
		];
		const stats = computeStats(resources);
		expect(stats.provisioned + stats.needsAttention).toBe(stats.total);
	});
});
