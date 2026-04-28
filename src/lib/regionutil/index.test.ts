import { describe, it, expect } from 'vitest';
import { name, flag, countryFlag } from './index';
import type { RegionRead } from '$lib/openapi/region';

function makeRegion(id: string, regionName: string): RegionRead {
	return { metadata: { id, name: regionName } } as RegionRead;
}

const regions = [
	makeRegion('d3bbfe22-cf3e-7hi1-ee9g-9ee2eg613d44', 'gb-north-1'),
	makeRegion('e4ccgf33-dg4f-8ij2-ff0h-0ff3fh724e55', 'us-east-1')
];

describe('name', () => {
	it('returns "unknown" when regions is undefined', () => {
		expect(name(undefined, 'r1')).toBe('unknown');
	});

	it('returns "unknown" when regionID is empty', () => {
		expect(name(regions, '')).toBe('unknown');
	});

	it('returns "unknown" when region ID not found', () => {
		expect(name(regions, 'f5ddgf44-eh5g-9jk3-gg1i-1gg4gi835f66')).toBe('unknown');
	});

	it('returns the region name when found', () => {
		expect(name(regions, 'd3bbfe22-cf3e-7hi1-ee9g-9ee2eg613d44')).toBe('gb-north-1');
		expect(name(regions, 'e4ccgf33-dg4f-8ij2-ff0h-0ff3fh724e55')).toBe('us-east-1');
	});
});

describe('countryFlag', () => {
	it('converts a 2-letter country code to a flag emoji', () => {
		expect(countryFlag('gb')).toBe('🇬🇧');
		expect(countryFlag('us')).toBe('🇺🇸');
		expect(countryFlag('de')).toBe('🇩🇪');
	});

	it('returns globe emoji for codes shorter than 2 letters', () => {
		expect(countryFlag('g')).toBe('🌐');
		expect(countryFlag('')).toBe('🌐');
	});

	it('is case-insensitive', () => {
		expect(countryFlag('GB')).toBe('🇬🇧');
	});
});

describe('flag', () => {
	it('returns globe emoji when regions is undefined', () => {
		expect(flag(undefined, 'r1')).toBe('🌐');
	});

	it('returns globe emoji when region not found', () => {
		expect(flag(regions, 'f5ddgf44-eh5g-9jk3-gg1i-1gg4gi835f66')).toBe('🌐');
	});

	it('derives flag from the country prefix of the region name', () => {
		expect(flag(regions, 'd3bbfe22-cf3e-7hi1-ee9g-9ee2eg613d44')).toBe('🇬🇧');
		expect(flag(regions, 'e4ccgf33-dg4f-8ij2-ff0h-0ff3fh724e55')).toBe('🇺🇸');
	});
});
