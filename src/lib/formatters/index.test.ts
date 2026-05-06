import { describe, it, expect } from 'vitest';
import { formatGB, ageFormatter } from './index';

describe('formatGB', () => {
	it('formats zero', () => {
		expect(formatGB(0)).toBe('0 GB');
	});

	it('formats positive integers', () => {
		expect(formatGB(1)).toBe('1 GB');
		expect(formatGB(512)).toBe('512 GB');
	});
});

describe('ageFormatter', () => {
	const now = new Date();

	it('formats seconds only', () => {
		const t = new Date(now.getTime() - 30_000);
		expect(ageFormatter(t)).toBe('30s');
	});

	it('formats minutes and seconds', () => {
		const t = new Date(now.getTime() - 90_000); // 1m 30s
		expect(ageFormatter(t)).toBe('1m 30s');
	});

	it('formats hours, minutes and seconds', () => {
		const t = new Date(now.getTime() - 3_661_000); // 1h 1m 1s
		expect(ageFormatter(t)).toBe('1h 1m 1s');
	});

	it('formats days, hours, minutes and seconds', () => {
		const t = new Date(now.getTime() - 90_061_000); // 1d 1h 1m 1s
		expect(ageFormatter(t)).toBe('1d 1h 1m 1s');
	});

	it('formats exactly 0 seconds as 0s', () => {
		const t = new Date(now.getTime());
		const result = ageFormatter(t);
		// May be 0s or 1s depending on timing; just check it's seconds-only format
		expect(result).toMatch(/^\d+s$/);
	});
});
