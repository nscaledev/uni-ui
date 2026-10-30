import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';
import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET } from '$app/env/private';

import * as OIDC from '#lib/oidc/index.ts';

// This forms the basis of a GET /oauth2/refresh?refresh_token=foo handler.  Given
// the client ID and secret are secret we need to do this.  We return the new token
// to the client in a header.
export const load: PageServerLoad = async ({ fetch, url, setHeaders }) => {
	const refreshToken = url.searchParams.get('refresh_token');
	if (!refreshToken) {
		error(400, 'OIDC refresh token not set');
	}

	const clientID = OIDC_CLIENT_ID;
	if (!clientID) {
		error(400, 'OIDC client ID not set');
	}

	const clientSecret = OIDC_CLIENT_SECRET;
	if (!clientSecret) {
		error(400, 'OIDC client secret not set');
	}

	const discovery = await OIDC.discovery(fetch);

	const form = new URLSearchParams({
		grant_type: 'refresh_token',
		client_id: clientID,
		client_secret: clientSecret,
		refresh_token: refreshToken
	});

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: form.toString()
	};

	const response = await fetch(discovery.token_endpoint, options);

	if (!response.ok) {
		error(400, 'OIDC token refresh failed');
	}

	const token = await response.json();

	setHeaders({ 'X-Unikorn-Token': JSON.stringify(token) });
};
