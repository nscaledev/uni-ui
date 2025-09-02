import Base64url from 'crypto-js/enc-base64url';
import SHA512 from 'crypto-js/sha512';
import CryptoJS from 'crypto-js/core';

import type { JWTVerifyResult } from 'jose';
import { env } from '$env/dynamic/public';

// These are required variables from the environment.
export const issuer = env.PUBLIC_ISSUER_HOST || '';

export type IDToken = {
	// openid scope.
	nonce: string;
	at_hash: string;
	// email scope.
	email: string;
	email_verified?: boolean;
	// profile scope.
	name?: string;
	given_name?: string;
	family_name?: string;
	middle_name?: string;
	nickname?: string;
	preferred_username?: string;
	profile?: string;
	picture?: string;
	website?: string;
	gender?: string;
	birthdate?: string;
	zoneinfo?: string;
	locale?: string;
	updated_at?: string;
};

// This is some of what's offered by the API, just enough
// to function for now.
export type DiscoveryInfo = {
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	jwks_uri: string;
};

// Return something that promises to return discovery data.
export function discovery(fetchImpl: typeof fetch): Promise<DiscoveryInfo> {
	const discoveryURL = `${issuer}/.well-known/openid-configuration`;
	const discoveryOptions = {
		method: 'GET'
	};

	return fetchImpl(discoveryURL, discoveryOptions)
		.then((response) => response.json())
		.catch((error) => console.log(error));
}

// See OIDC Core 1.0 sections 3.1.3.6, 3.1.3.8.
export function compareAccessTokenHash(jwt: JWTVerifyResult, at: string) {
	let atHash;

	switch (jwt.protectedHeader.alg) {
		case 'ES512':
			{
				const sum = SHA512(at);

				atHash = Base64url.stringify(
					CryptoJS.lib.WordArray.create(
						sum.words.slice(0, sum.words.length >> 1),
						sum.sigBytes >> 1
					)
				);
			}

			break;
		default:
			throw `unhandled hash algorithm ${jwt.protectedHeader.alg}`;
	}

	if (atHash != jwt.payload.at_hash) {
		throw `access token hash mismatch`;
	}
}
