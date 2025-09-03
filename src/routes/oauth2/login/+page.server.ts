import type { PageServerLoad } from './$types';
import Base64url from 'crypto-js/enc-base64url';
import CryptoJS from 'crypto-js';

// This is the first step in authentication, we are going to generate an OIDC
// nonce and PKCE code verifier, then set them as cookies in the client so we
// can retrieve them later in the callback.  This is vitally important for the
// code verifier as we need to use this server-side during code exchange which
// uses the client secret.
export const load: PageServerLoad = ({ cookies }) => {
	const nonce = CryptoJS.lib.WordArray.random(16).toString(Base64url);
	const codeChallengeVerifier = CryptoJS.lib.WordArray.random(32).toString(Base64url);

	cookies.set('oidc_nonce', nonce, { path: '/' });
	cookies.set('oidc_code_challenge_verifier', codeChallengeVerifier, { path: '/' });

	return {};
};
