import { sessionstore } from '#lib/sessionstore/index.ts';
import * as Identity from '#lib/openapi/identity/index.ts';

// OrganizationInfo wraps up stuff about an organization that should
// be atomic to make life easier for pages.
export type OrganizationInfo = {
	id: string;
	acl: Identity.Acl;
};

export const organizationStore = sessionstore<OrganizationInfo>('organization');
