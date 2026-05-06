import { error } from '@sveltejs/kit';
import { invalidate } from '$app/navigation';
import { navigating } from '$app/state';

interface Lengthable {
	length: number;
}

export async function assertNonEmptyList<Type extends Lengthable>(
	lister: Promise<Type>
): Promise<Type> {
	const list = await lister;

	if (list.length == 0) {
		error(500, `list type is unexpectedly empty, ensure your deployment is configured correctly`);
	}

	return list;
}

// startAutoRefresh schedules periodic invalidation of a SvelteKit load key,
// skipping ticks while a navigation is in progress. Returns a cleanup function
// intended for use as the onMount return value.
export function startAutoRefresh(key: string, intervalMs = 5000): () => void {
	const interval = setInterval(() => {
		if (!navigating.to) invalidate(key);
	}, intervalMs);
	return () => clearInterval(interval);
}
