import type { PageServerLoad } from './$types';

import { redirect, error } from '@sveltejs/kit';
import { OIDC_CLIENT_ID } from '$app/env/private';

import Base64url from 'crypto-js/enc-base64url';
import SHA256 from 'crypto-js/sha256';

import * as OIDC from '#lib/oidc/index.ts';

// We hit /oauth2/login which has set our cookies for the nonce and PKCE, now we
// can begin the oauth2 flow for real...
export const load: PageServerLoad = async ({ fetch, url, cookies }) => {
	const oidc = await OIDC.discovery(fetch);

	const nonce = cookies.get('oidc_nonce');
	if (!nonce) {
		error(400, 'OIDC nonce not set');
	}

	const codeChallengeVerifier = cookies.get('oidc_code_challenge_verifier');
	if (!codeChallengeVerifier) {
		error(400, 'OIDC code challenge verifier not set');
	}

	const clientID = OIDC_CLIENT_ID;
	if (!clientID) {
		error(400, 'OIDC client ID not set');
	}

	const nonceHash = SHA256(nonce).toString(Base64url);
	const codeChallenge = SHA256(codeChallengeVerifier).toString(Base64url);

	const query = new URLSearchParams({
		response_type: 'code',
		client_id: clientID,
		redirect_uri: `${url.protocol}//${url.host}/oauth2/callback`,
		code_challenge_method: 'S256',
		code_challenge: codeChallenge,
		scope: 'openid email profile',
		nonce: nonceHash
	});

	const target = new URL(oidc.authorization_endpoint);
	target.search = query.toString();

	redirect(307, target.toString());
};
