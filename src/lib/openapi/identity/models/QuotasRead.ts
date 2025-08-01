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
import type { QuotaRead } from './QuotaRead';
import {
    QuotaReadFromJSON,
    QuotaReadFromJSONTyped,
    QuotaReadToJSON,
} from './QuotaRead';

/**
 * A list of quotas.
 * @export
 * @interface QuotasRead
 */
export interface QuotasRead {
    /**
     * A list of quotas.
     * @type {Array<QuotaRead>}
     * @memberof QuotasRead
     */
    quotas: Array<QuotaRead>;
}

/**
 * Check if a given object implements the QuotasRead interface.
 */
export function instanceOfQuotasRead(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "quotas" in value;

    return isInstance;
}

export function QuotasReadFromJSON(json: any): QuotasRead {
    return QuotasReadFromJSONTyped(json, false);
}

export function QuotasReadFromJSONTyped(json: any, ignoreDiscriminator: boolean): QuotasRead {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'quotas': ((json['quotas'] as Array<any>).map(QuotaReadFromJSON)),
    };
}

export function QuotasReadToJSON(value?: QuotasRead | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'quotas': ((value.quotas as Array<any>).map(QuotaReadToJSON)),
    };
}

