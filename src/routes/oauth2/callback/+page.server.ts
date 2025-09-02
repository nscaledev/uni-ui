export const ssr = false;

import Base64url from 'crypto-js/enc-base64url';
import SHA256 from 'crypto-js/sha256';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import type { InternalToken } from '$lib/oauth2';
import * as OIDC from '$lib/oidc';

type OAuth2Error = {
	error: string;
	error_description: string;
};

// All has gone well so far and the OIDC server has either given us an error or
// an authorization code that we can exchange for some tokens.  For that we need
// our PKCE cookies from the browser session and the server-side client secret.
export const load: PageServerLoad = async ({ fetch, url, cookies }) => {
	if (url.searchParams.has('error')) {
		error(
			400,
			`oauth2 authentication failed with error ${url.searchParams.get('error')}: ${url.searchParams.get('error_description')}`
		);
	}

	const nonce = cookies.get('oidc_nonce');
	if (!nonce) {
		error(400, 'OIDC nonce not set');
	}

	const codeChallengeVerifier = cookies.get('oidc_code_challenge_verifier');
	if (!codeChallengeVerifier) {
		error(400, 'OIDC code challenge verifier not set');
	}

	const clientID = env.OIDC_CLIENT_ID;
	if (!clientID) {
		error(400, 'OIDC client ID not set');
	}

	const clientSecret = env.OIDC_CLIENT_SECRET;
	if (!clientSecret) {
		error(400, 'OIDC client secret not set');
	}

	const code = url.searchParams.get('code');
	if (!code) {
		error(400, `oauth2 authentication did not respond with an authorization code`);
	}

	// Code exchange...
	const discovery = await OIDC.discovery(fetch);

	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		client_id: clientID,
		client_secret: clientSecret,
		redirect_uri: `${url.protocol}//${url.host}/oauth2/callback`,
		code: code,
		code_verifier: codeChallengeVerifier
	});

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: body.toString()
	};

	const response = await fetch(discovery.token_endpoint, options);

	const result = await response.json();

	if (!response.ok) {
		const e = result as OAuth2Error;

		error(400, `oauth2 token exchange failed with error ${e.error}: ${e.error_description}`);
	}

	// Verify the ID token against the OIDC JWKs etc.
	const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri));

	const jwt = await jwtVerify(result.id_token, jwks, {
		issuer: discovery.issuer,
		audience: clientID
	});

	const idToken = jwt.payload as OIDC.IDToken;
	if (idToken.nonce != SHA256(nonce).toString(Base64url)) {
		error(400, 'OIDC ID token nonce does not match, possible replay attack');
	}

	// TODO: I've removed this because Auth0 does not return at_hash, which I _think_ is optional in the authorization_code flow.

	// // Verify the access token matches the hash in the signed ID token.
	// try {
	// 	OIDC.compareAccessTokenHash(jwt, result.access_token);
	// } catch (err) {
	// 	const e = err as Error;

	// 	error(400, `oauth2 access token error: ${e.message}`);
	// }

	const token = result as InternalToken;

	// Set the expiry time so we know when to perform a rotation.
	// Add a little wiggle room in there to account for any latency.
	const expiry = new Date(Date.now());
	expiry.setSeconds(expiry.getSeconds() + token.expires_in - 60);

	token.expiry = expiry.toJSON();

	// Pass the tokens back to the client for persistence in session storage.
	return {
		token: token,
		idToken: idToken
	};
};
