import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ url }) => {
	const callback = url.searchParams.get('callback');
	if (!callback) {
		error(400, 'no callback parameter');
	}

	// Validate callback is a safe, same-origin path or HTTPS URL on the same host.
	let callbackUrl: URL;
	try {
		callbackUrl = new URL(callback, url.origin);
	} catch {
		error(400, 'invalid callback parameter');
	}

	if (callbackUrl.protocol !== 'https:' && callbackUrl.protocol !== 'http:') {
		error(400, 'invalid callback scheme');
	}

	if (callbackUrl.host !== url.host) {
		error(400, 'callback must be on the same host');
	}

	const state = url.searchParams.get('state');
	if (!state) {
		error(400, 'no state parameter');
	}

	const providers = url.searchParams.get('providers')?.split(' ') || [];

	return {
		callback: callbackUrl.toString(),
		state: state,
		providers: providers
	};
};
