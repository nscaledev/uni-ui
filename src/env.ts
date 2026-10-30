import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value;

export const variables = defineEnvVars({
	PUBLIC_IDENTITY_HOST: { public: true, schema: optional },
	PUBLIC_REGION_HOST: { public: true, schema: optional },
	PUBLIC_KUBERNETES_HOST: { public: true, schema: optional },
	PUBLIC_COMPUTE_HOST: { public: true, schema: optional },
	PUBLIC_TITLE: { public: true, schema: optional },
	PUBLIC_FAVICON: { public: true, schema: optional },
	PUBLIC_LOGO: { public: true, schema: optional },
	OIDC_CLIENT_ID: { schema: optional },
	OIDC_CLIENT_SECRET: { schema: optional }
});
