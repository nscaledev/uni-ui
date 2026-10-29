import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

export const load: PageLoad = async ({ url }) => {
	const callback = url.searchParams.get('callback');
	if (!callback) {
		error(400, 'no callback parameter');
	}

	// The callback becomes the form's action, so it MUST address identity and
	// nothing else. Do not narrow this to same-origin: the dialog is served by
	// the UI while the callback is always on identity, a different host in every
	// deployment, so a same-host rule rejects every real login.
	let callbackUrl: URL;
	try {
		callbackUrl = new URL(callback, url.origin);
	} catch {
		error(400, 'invalid callback parameter');
	}

	if (!env.PUBLIC_IDENTITY_HOST) {
		error(500, 'identity host not configured');
	}

	let identityUrl: URL;
	try {
		identityUrl = new URL(env.PUBLIC_IDENTITY_HOST);
	} catch {
		error(500, 'identity host malformed');
	}

	// Origin covers scheme, host and port together, and a javascript: or data:
	// callback has origin "null", so those are rejected here too.
	if (callbackUrl.origin !== identityUrl.origin) {
		error(400, 'callback must be on the identity service');
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
