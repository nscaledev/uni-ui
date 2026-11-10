import { describe, it, expect, vi, beforeEach } from 'vitest';

const IDENTITY = 'https://identity.example.com';
const UI_ORIGIN = 'https://console.example.com';
const AUTHORIZATION = `${IDENTITY}/oauth2/v2/authorization`;

vi.mock('$app/env/public', () => ({
	PUBLIC_IDENTITY_HOST: IDENTITY
}));

vi.mock('$app/env/private', () => ({
	OIDC_CLIENT_ID: 'a-client-id'
}));

// Discovery is the only thing the loader fetches.
const fetchImpl = (async () =>
	new Response(JSON.stringify({ authorization_endpoint: AUTHORIZATION }))) as typeof fetch;

async function load(cookieValues: Record<string, string>) {
	const { load } = await import('./+page.server');

	const cookies = { get: (name: string) => cookieValues[name] };

	return (load as (event: { fetch: typeof fetch; url: URL; cookies: typeof cookies }) => unknown)({
		fetch: fetchImpl,
		url: new URL(`${UI_ORIGIN}/oauth2/login2`),
		cookies
	});
}

async function rejectionOf(
	promise: Promise<unknown>
): Promise<{ status?: number; location?: string }> {
	try {
		await promise;
	} catch (e) {
		return e as { status?: number; location?: string };
	}

	throw new Error('expected the loader to reject');
}

const COOKIES = {
	oidc_nonce: 'a-nonce',
	oidc_code_challenge_verifier: 'a-verifier'
};

describe('login2 redirect to identity', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	// Identity is always a different origin from the UI, and SvelteKit 3 blocks
	// off-origin redirects unless they are allowlisted. Without the allowlist
	// every login dies here with a 500 before identity is ever reached.
	it('redirects to the identity authorization endpoint', async () => {
		const result = await rejectionOf(load(COOKIES));

		expect(result.status).toBe(307);
		expect(result.location).toMatch(new RegExp(`^${AUTHORIZATION}\\?`));
	});

	it('sends the PKCE and nonce parameters along', async () => {
		const result = await rejectionOf(load(COOKIES));

		const params = new URL(result.location as string).searchParams;

		expect(params.get('client_id')).toBe('a-client-id');
		expect(params.get('redirect_uri')).toBe(`${UI_ORIGIN}/oauth2/callback`);
		expect(params.get('code_challenge_method')).toBe('S256');
		expect(params.get('code_challenge')).toBeTruthy();
		expect(params.get('nonce')).toBeTruthy();
	});

	it('rejects a missing nonce cookie', async () => {
		expect((await rejectionOf(load({ oidc_code_challenge_verifier: 'x' }))).status).toBe(400);
	});

	it('rejects a missing code verifier cookie', async () => {
		expect((await rejectionOf(load({ oidc_nonce: 'x' }))).status).toBe(400);
	});
});
