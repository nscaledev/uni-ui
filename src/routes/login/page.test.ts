import { describe, it, expect, vi, beforeEach } from 'vitest';

const IDENTITY = 'https://identity.example.com';
const UI_ORIGIN = 'https://console.example.com';

// The UI and identity are different hosts in every deployment, so these tests
// pin the rule that actually matters: the callback must address identity. An
// earlier same-host check satisfied a scanner and rejected every real login.
vi.mock('$app/env/public', () => ({
	PUBLIC_IDENTITY_HOST: IDENTITY
}));

async function load(params: Record<string, string>) {
	const { load } = await import('./+page');

	const url = new URL(UI_ORIGIN);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}

	// Only `url` is read by the loader.
	return (load as (event: { url: URL }) => unknown)({ url });
}

function callbackOf(result: unknown): string {
	return (result as { callback: string }).callback;
}

async function statusOf(promise: Promise<unknown>): Promise<number> {
	try {
		await promise;
	} catch (e) {
		return (e as { status: number }).status;
	}

	throw new Error('expected the loader to reject');
}

const VALID = {
	callback: `${IDENTITY}/oauth2/v2/login`,
	state: 'a-state-token',
	providers: 'github google'
};

describe('login callback validation', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('accepts a callback on the identity service from a different host', async () => {
		const result = await load(VALID);

		expect(callbackOf(result)).toBe(`${IDENTITY}/oauth2/v2/login`);
	});

	it('returns the state and providers unchanged', async () => {
		const result = await load(VALID);

		expect(result).toMatchObject({
			state: 'a-state-token',
			providers: ['github', 'google']
		});
	});

	// Each of these was reachable before the callback was constrained to
	// identity's origin. The form posts to this value, so an attacker-chosen
	// callback is an open redirect and a credential leak.
	it.each([
		['an attacker host', 'https://evil.example.com/steal'],
		['a javascript: scheme', 'javascript:alert(1)'],
		['a data: scheme', 'data:text/html,<script>alert(1)</script>'],
		['userinfo disguising the host', `${IDENTITY}@evil.example.com/`],
		['identity on another port', 'https://identity.example.com:8443/oauth2/v2/login'],
		['identity downgraded to http', 'http://identity.example.com/oauth2/v2/login'],
		['the UI itself, as a relative path', '/dashboard'],
		['the UI itself, absolute', `${UI_ORIGIN}/dashboard`]
	])('rejects %s', async (_name, callback) => {
		expect(await statusOf(load({ ...VALID, callback }))).toBe(400);
	});

	it('rejects a missing callback', async () => {
		expect(await statusOf(load({ state: VALID.state }))).toBe(400);
	});

	it('rejects a missing state', async () => {
		expect(await statusOf(load({ callback: VALID.callback }))).toBe(400);
	});
});

describe('login callback validation without an identity host', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	// Failing closed matters: with no identity host there is nothing to validate
	// against, and accepting the callback would restore the open redirect.
	it('fails rather than accepting any callback', async () => {
		vi.doMock('$app/env/public', () => ({ PUBLIC_IDENTITY_HOST: '' }));

		expect(await statusOf(load(VALID))).toBe(500);
	});
});
