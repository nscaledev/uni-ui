import * as Region from '#lib/openapi/region/index.ts';

export type NumberFormatter = (n: number) => string;

export function formatGB(n: number): string {
	return `${n} GB`;
}

export function ageFormatter(time: Date): string {
	// Get age of the instance in seconds.
	const now = Date.now();

	let age = Math.floor((now - time.valueOf()) / 1000);

	const seconds = age % 60;
	age = Math.floor(age / 60);

	if (!age) return `${seconds}s`;

	const minutes = age % 60;
	age = Math.floor(age / 60);

	if (!age) return `${minutes}m ${seconds}s`;

	const hours = age % 24;
	age = Math.floor(age / 24);

	if (!age) return `${hours}h ${minutes}m ${seconds}s`;

	return `${age}d ${hours}h ${minutes}m ${seconds}s`;
}
