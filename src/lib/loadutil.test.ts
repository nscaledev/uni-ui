import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock SvelteKit modules before importing the module under test
vi.mock('$app/navigation', () => ({ invalidate: vi.fn() }));
vi.mock('$app/state', () => ({ navigating: { to: null } }));
vi.mock('@sveltejs/kit', () => ({
	error: vi.fn((status: number, message: string) => {
		throw { status, message };
	})
}));

import { startAutoRefresh, assertNonEmptyList } from './loadutil';
import { invalidate } from '$app/navigation';
import { navigating } from '$app/state';

const mockInvalidate = vi.mocked(invalidate);
const mockNavigating = navigating as { to: unknown };

beforeEach(() => {
	vi.useFakeTimers();
	mockInvalidate.mockReset();
	mockNavigating.to = null;
});

afterEach(() => {
	vi.useRealTimers();
});

describe('startAutoRefresh', () => {
	it('calls invalidate with the given key after the interval', () => {
		const cleanup = startAutoRefresh('layout:networks', 5000);

		vi.advanceTimersByTime(5000);
		expect(mockInvalidate).toHaveBeenCalledWith('layout:networks');

		cleanup();
	});

	it('calls invalidate on each tick', () => {
		const cleanup = startAutoRefresh('layout:networks', 5000);

		vi.advanceTimersByTime(15000);
		expect(mockInvalidate).toHaveBeenCalledTimes(3);

		cleanup();
	});

	it('skips invalidate when navigation is in progress', () => {
		mockNavigating.to = { url: new URL('http://localhost/other') };

		const cleanup = startAutoRefresh('layout:networks', 5000);

		vi.advanceTimersByTime(5000);
		expect(mockInvalidate).not.toHaveBeenCalled();

		cleanup();
	});

	it('resumes invalidating after navigation completes', () => {
		mockNavigating.to = { url: new URL('http://localhost/other') };

		const cleanup = startAutoRefresh('layout:networks', 5000);

		vi.advanceTimersByTime(5000);
		expect(mockInvalidate).not.toHaveBeenCalled();

		mockNavigating.to = null;
		vi.advanceTimersByTime(5000);
		expect(mockInvalidate).toHaveBeenCalledTimes(1);

		cleanup();
	});

	it('stops calling invalidate after cleanup', () => {
		const cleanup = startAutoRefresh('layout:networks', 5000);

		cleanup();
		vi.advanceTimersByTime(15000);
		expect(mockInvalidate).not.toHaveBeenCalled();
	});

	it('defaults to 5000ms interval', () => {
		const cleanup = startAutoRefresh('layout:networks');

		vi.advanceTimersByTime(4999);
		expect(mockInvalidate).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(mockInvalidate).toHaveBeenCalledTimes(1);

		cleanup();
	});
});

describe('assertNonEmptyList', () => {
	it('returns the list when non-empty', async () => {
		const result = await assertNonEmptyList(Promise.resolve([1, 2, 3]));
		expect(result).toEqual([1, 2, 3]);
	});

	it('throws when the list is empty', async () => {
		await expect(assertNonEmptyList(Promise.resolve([]))).rejects.toMatchObject({
			status: 500
		});
	});
});
