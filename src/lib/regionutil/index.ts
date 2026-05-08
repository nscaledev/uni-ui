import type { RegionRead } from '$lib/openapi/region';

export function name(regions: Array<RegionRead> | undefined, regionID: string): string {
	if (!regions || !regionID) return 'unknown';
	return regions.find((x) => x.metadata.id == regionID)?.metadata.name ?? 'unknown';
}

// Returns a Unicode flag emoji derived from the country prefix of the region
// name (e.g. "gb-north-1" → "🇬🇧"). Falls back to 🌐 for macro-regions.
export function flag(regions: Array<RegionRead> | undefined, regionID: string): string {
	const regionName = name(regions, regionID);
	if (regionName === 'unknown') return '🌐';
	return countryFlag(regionName.split('-')[0]);
}

export function countryFlag(code: string): string {
	// Unicode regional indicator symbols: A=0x1F1E6, offset from 'a'=0x61
	const base = 0x1f1e6 - 0x61;
	const chars = code
		.toLowerCase()
		.split('')
		.filter((c) => c >= 'a' && c <= 'z')
		.slice(0, 2);
	if (chars.length < 2) return '🌐';
	return String.fromCodePoint(base + chars[0].charCodeAt(0), base + chars[1].charCodeAt(0));
}
