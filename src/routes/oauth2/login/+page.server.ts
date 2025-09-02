import type { PageServerLoad } from './$types';

// This is the first step in authentication, we are going to generate an OIDC
// nonce and PKCE code verifier, then set them as cookies in the client so we
// can retrieve them later in the callback.  This is vitally important for the
// code verifier as we need to use this server-side during code exchange which
// uses the client secret.
export const load: PageServerLoad = ({ cookies }) => {
	const nonceBytes = new Uint8Array(16);
	crypto.getRandomValues(nonceBytes);

	const nonce = btoa(nonceBytes.toString());

	const codeChallengeVerifierBytes = new Uint8Array(33); // a multiple of 3 so that the base64 encoding does not have padding, which can upset OIDC APIs
	crypto.getRandomValues(codeChallengeVerifierBytes);

	const codeChallengeVerifier = urlsafe(btoa(String.fromCharCode(...codeChallengeVerifierBytes)));

	cookies.set('oidc_nonce', nonce, { path: '/' });
	cookies.set('oidc_code_challenge_verifier', codeChallengeVerifier, { path: '/' });

	return {};
};

function urlsafe(str: String) {
	return str.replaceAll('+', '-').replaceAll('/', '_')
}
