import { env } from '$env/dynamic/public';

import * as OIDC from '$lib/oidc';
import type { InternalToken } from '$lib/oauth2';

import * as Kubernetes from '$lib/openapi/kubernetes';
import * as Compute from '$lib/openapi/compute';
import * as Application from '$lib/openapi/application';
import * as Identity from '$lib/openapi/identity';
import * as Region from '$lib/openapi/region';
import { token, removeCredentials } from '$lib/credentials';

import { ROOT_CONTEXT, defaultTextMapSetter, trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// authenticationMiddleware performs logout if the request is unauthorized.
function authenticationMiddleware(): Identity.Middleware {
	return {
		post: (ctx: Identity.ResponseContext): Promise<void | Response> => {
			return new Promise((resolve) => {
				if (ctx.response.status == 401) removeCredentials();
				resolve();
			});
		}
	};
}

// traceContextMiddleware injects w3c trace context to support request tracing and simple
// handling of support requests.
function traceContextMiddleware(): Identity.Middleware {
	// Cache the span across the call so we can get at the trace
	// context, in particular the trace ID, after the call completes.
	let span: Span;

	return {
		pre: (ctx: Identity.RequestContext): Promise<Identity.FetchParams | void> => {
			return new Promise((resolve) => {
				const tracer = trace.getTracer('unikorn-ui');
				span = tracer.startSpan(ctx.url);

				const propagator = new W3CTraceContextPropagator();

				propagator.inject(
					trace.setSpanContext(ROOT_CONTEXT, span.spanContext()),
					ctx.init.headers,
					defaultTextMapSetter
				);

				resolve();
			});
		},
		post: (ctx: Identity.ResponseContext) => {
			return new Promise(async (resolve) => {
				span.end();

				const headers = new Headers({ traceparent: span.spanContext().traceId });
				ctx.response.headers.forEach((value, key) => headers.append(key, value));

				const body = await ctx.response.blob();

				resolve(new Response(body, { status: ctx.response.status, headers: headers }));
			});
		}
	};
}

// accessToken is a callback to get the Authorization header.  Crucially this
// also has a reference to the full token, so san see when the access token
// has expired and refresh it using the refresh token.
async function accessToken(tokens: InternalToken, fetchImpl?: typeof fetch): Promise<string> {
	if (!tokens) return '';

	// TODO: we could get multiple API calls concurrently, at which point
	// we are repeating the operation, be nice if we could handle this
	// somehow.
	if (new Date(Date.now()).toJSON() > tokens.expiry) {
		const query = new URLSearchParams({
			refresh_token: tokens.refresh_token
		});

		const target = new URL(`${window.location.protocol}//${window.location.host}/oauth2/refresh`);
		target.search = query.toString();

		const response = await fetch(target.toString());
		if (!response.ok) {
			removeCredentials();
			return '';
		}

		const tokenRaw = response.headers.get('X-Unikorn-Token');
		if (!tokenRaw) {
			console.log('token header missing');
			return '';
		}

		const new_token = JSON.parse(tokenRaw) as InternalToken;

		// Set the expiry time so we know when to perform a rotation.
		// Add a little wiggle room in there to account for any latency.
		const expiry = new Date(Date.now());
		expiry.setSeconds(expiry.getSeconds() + new_token.expires_in - 60);
		new_token.expiry = expiry.toJSON();

		// Update the session storage.
		token.set(new_token);

		Object.assign(tokens, new_token);
	}

	return tokens.token_type + ' ' + tokens.access_token;
}

// client gets a new initialized client with auth and any additional middlewares.
export function kubernetes(tokens: InternalToken, fetchImpl?: typeof fetch): Kubernetes.DefaultApi {
	const config = new Kubernetes.Configuration({
		basePath: env.PUBLIC_KUBERNETES_HOST,
		accessToken: async () => accessToken(tokens, fetchImpl),
		middleware: [authenticationMiddleware(), traceContextMiddleware()],
		fetchApi: fetchImpl
	});

	return new Kubernetes.DefaultApi(config);
}

export function compute(tokens: InternalToken, fetchImpl?: typeof fetch): Compute.DefaultApi {
	const config = new Compute.Configuration({
		basePath: env.PUBLIC_COMPUTE_HOST,
		accessToken: async () => accessToken(tokens, fetchImpl),
		middleware: [authenticationMiddleware(), traceContextMiddleware()],
		fetchApi: fetchImpl
	});

	return new Compute.DefaultApi(config);
}

export function application(
	tokens: InternalToken,
	fetchImpl?: typeof fetch
): Application.DefaultApi {
	const config = new Application.Configuration({
		basePath: env.PUBLIC_APPLICATION_HOST,
		accessToken: async () => accessToken(tokens, fetchImpl),
		middleware: [authenticationMiddleware(), traceContextMiddleware()],
		fetchApi: fetchImpl
	});

	return new Application.DefaultApi(config);
}

export function identity(tokens: InternalToken, fetchImpl?: typeof fetch): Identity.DefaultApi {
	const config = new Identity.Configuration({
		basePath: env.PUBLIC_IDENTITY_HOST,
		accessToken: async () => accessToken(tokens, fetchImpl),
		middleware: [authenticationMiddleware(), traceContextMiddleware()],
		fetchApi: fetchImpl
	});

	return new Identity.DefaultApi(config);
}

export function region(tokens: InternalToken, fetchImpl?: typeof fetch): Region.DefaultApi {
	const config = new Region.Configuration({
		basePath: env.PUBLIC_REGION_HOST,
		accessToken: async () => accessToken(tokens, fetchImpl),
		middleware: [authenticationMiddleware(), traceContextMiddleware()],
		fetchApi: fetchImpl
	});

	return new Region.DefaultApi(config);
}

// error is a generic fallback when an exception occurs, everything else should
// be handled in a middleware, and not on a per API basis.
export async function error(error: Error) {
	const responseError = error as Identity.ResponseError;

	const errorJSON = Identity.ModelErrorFromJSON(await responseError.response.json());

	/*
	const toast = {
		autohide: false,
		message: `An error has occurred - trace ID: ${responseError.response.headers.get('traceparent')}, error: ${errorJSON.error}, description:  ${errorJSON.errorDescription}`,
		background: 'preset-filled-error-500'
	};

	toaster.trigger(toast);
       */

	console.log(
		`An error has occurred - trace ID: ${responseError.response.headers.get('traceparent')}, error: ${errorJSON.error}, description:  ${errorJSON.errorDescription}`
	);
}
