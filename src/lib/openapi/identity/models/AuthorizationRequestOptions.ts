/* tslint:disable */
/* eslint-disable */
/**
 * Identity API
 * The Identity API provides an OIDC compliant interface for use with all official and 3rd party services and proxies.  As its intended use is for multi-tenant cloud deployments, it acts as an aggregation layer for other 3rd party OIDC services, dispatching login requests to the required OIDC backend.  Token introspection forms the basis of role based access control across all APIs.  For security purposes, access tokens and refresh tokens are limited to a single session per client, thus if they are being consumed by a horizontally scalable platform care must be taken to ensure token rotation is handled atomically by a single process, and the tokens are distributed to each service instance synchronously.
 *
 * The version of the OpenAPI document: 1.4.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { ResponseType } from './ResponseType';
import {
    ResponseTypeFromJSON,
    ResponseTypeFromJSONTyped,
    ResponseTypeToJSON,
} from './ResponseType';

/**
 * OAuth 2.0/OIDC authorization endpoint request.
 * @export
 * @interface AuthorizationRequestOptions
 */
export interface AuthorizationRequestOptions {
    /**
     * 
     * @type {ResponseType}
     * @memberof AuthorizationRequestOptions
     */
    responseType: ResponseType;
    /**
     * The client identifier.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    clientId: string;
    /**
     * The registered callback address.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    redirectUri: string;
    /**
     * Authorization scope.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    scope?: string | null;
    /**
     * Client state information.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    state?: string | null;
    /**
     * OIDC nonce.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    nonce?: string | null;
    /**
     * Max age of the login.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    maxAge?: string | null;
    /**
     * How to display the login prompt.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    display?: string | null;
    /**
     * OIDC prompt.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    prompt?: string | null;
    /**
     * Language options.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    uiLocales?: string | null;
    /**
     * A previously issued ID token.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    idTokenHint?: string | null;
    /**
     * A login hint e.g. user name.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    loginHint?: string | null;
    /**
     * Requested content class reference values.
     * @type {string}
     * @memberof AuthorizationRequestOptions
     */
    acrValues?: string | null;
}

/**
 * Check if a given object implements the AuthorizationRequestOptions interface.
 */
export function instanceOfAuthorizationRequestOptions(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "responseType" in value;
    isInstance = isInstance && "clientId" in value;
    isInstance = isInstance && "redirectUri" in value;

    return isInstance;
}

export function AuthorizationRequestOptionsFromJSON(json: any): AuthorizationRequestOptions {
    return AuthorizationRequestOptionsFromJSONTyped(json, false);
}

export function AuthorizationRequestOptionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): AuthorizationRequestOptions {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'responseType': ResponseTypeFromJSON(json['response_type']),
        'clientId': json['client_id'],
        'redirectUri': json['redirect_uri'],
        'scope': !exists(json, 'scope') ? undefined : json['scope'],
        'state': !exists(json, 'state') ? undefined : json['state'],
        'nonce': !exists(json, 'nonce') ? undefined : json['nonce'],
        'maxAge': !exists(json, 'max_age') ? undefined : json['max_age'],
        'display': !exists(json, 'display') ? undefined : json['display'],
        'prompt': !exists(json, 'prompt') ? undefined : json['prompt'],
        'uiLocales': !exists(json, 'ui_locales') ? undefined : json['ui_locales'],
        'idTokenHint': !exists(json, 'id_token_hint') ? undefined : json['id_token_hint'],
        'loginHint': !exists(json, 'login_hint') ? undefined : json['login_hint'],
        'acrValues': !exists(json, 'acr_values') ? undefined : json['acr_values'],
    };
}

export function AuthorizationRequestOptionsToJSON(value?: AuthorizationRequestOptions | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'response_type': ResponseTypeToJSON(value.responseType),
        'client_id': value.clientId,
        'redirect_uri': value.redirectUri,
        'scope': value.scope,
        'state': value.state,
        'nonce': value.nonce,
        'max_age': value.maxAge,
        'display': value.display,
        'prompt': value.prompt,
        'ui_locales': value.uiLocales,
        'id_token_hint': value.idTokenHint,
        'login_hint': value.loginHint,
        'acr_values': value.acrValues,
    };
}

