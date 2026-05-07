import { describe, it, expect } from 'vitest';
import { computeStats } from './stats';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

function makeResource(provisioningStatus: string, daysAgo: number, deletionTime?: Date) {
	return {
		metadata: {
			provisioningStatus,
			creationTime: new Date(Date.now() - daysAgo * DAY),
			deletionTime
		}
	};
}

describe('computeStats', () => {
	it('returns all zeros for an empty array', () => {
		expect(computeStats([])).toEqual({
			total: 0,
			provisioned: 0,
			needsAttention: 0,
			errorCount: 0,
			stuckDeprovisioning: 0,
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

	describe('errorCount', () => {
		it('counts only error status', () => {
			const resources = [
				makeResource('provisioned', 1),
				makeResource('error', 2),
				makeResource('pending', 3),
				makeResource('provisioning', 4),
				makeResource('unknown', 5)
			];
			expect(computeStats(resources).errorCount).toBe(1);
		});

		it('provisioning/pending/deprovisioning do not count as errors', () => {
			const resources = [
				makeResource('provisioning', 1),
				makeResource('pending', 2),
				makeResource('deprovisioning', 3)
			];
			expect(computeStats(resources).errorCount).toBe(0);
		});
	});

	describe('stuckDeprovisioning', () => {
		it('does not count deprovisioning without a deletionTime', () => {
			const resources = [makeResource('deprovisioning', 1)];
			expect(computeStats(resources).stuckDeprovisioning).toBe(0);
		});

		it('does not count deprovisioning with deletionTime under 1 hour ago', () => {
			const resources = [makeResource('deprovisioning', 1, new Date(Date.now() - 30 * 60 * 1000))];
			expect(computeStats(resources).stuckDeprovisioning).toBe(0);
		});

		it('does not count deprovisioning with deletionTime exactly at 1 hour', () => {
			const resources = [makeResource('deprovisioning', 1, new Date(Date.now() - HOUR))];
			expect(computeStats(resources).stuckDeprovisioning).toBe(0);
		});

		it('counts deprovisioning with deletionTime over 1 hour ago', () => {
			const resources = [
				makeResource('deprovisioning', 1, new Date(Date.now() - 2 * HOUR)),
				makeResource('deprovisioning', 7, new Date(Date.now() - 7 * DAY))
			];
			expect(computeStats(resources).stuckDeprovisioning).toBe(2);
		});

		it('does not count non-deprovisioning resources with old deletionTime', () => {
			const resources = [
				makeResource('error', 1, new Date(Date.now() - 2 * HOUR)),
				makeResource('provisioned', 1, new Date(Date.now() - 7 * DAY))
			];
			expect(computeStats(resources).stuckDeprovisioning).toBe(0);
		});
	});

	describe('needsAttention', () => {
		it('equals errorCount + stuckDeprovisioning', () => {
			const resources = [
				makeResource('error', 1),
				makeResource('error', 2),
				makeResource('deprovisioning', 3, new Date(Date.now() - 2 * HOUR)),
				makeResource('provisioned', 4)
			];
			const stats = computeStats(resources);
			expect(stats.needsAttention).toBe(stats.errorCount + stats.stuckDeprovisioning);
			expect(stats.needsAttention).toBe(3);
		});

		it('is zero when no errors or stuck deprovisioning', () => {
			const resources = [
				makeResource('provisioned', 1),
				makeResource('deprovisioning', 2) // no deletionTime — not stuck
			];
			expect(computeStats(resources).needsAttention).toBe(0);
		});
	});
});
