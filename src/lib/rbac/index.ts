import * as Identity from '$lib/openapi/identity';

export type OrganizationScope = {
	endpoint: string;
	operations: Array<Identity.AclOperation>;
};

export type ProjectScope = {
	projectID: string;
	endpoint: string;
	operations: Array<Identity.AclOperation>;
};

// This is the core of RBAC, we can do something if a named endpoint matches with
// the correct operation.
function operationAllowedEndpoint(
	e: Identity.AclEndpoint,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	return e.name == endpoint && operations.every((x) => e.operations.includes(x));
}

// This finds a maching endpoint in a list.
function operationAllowedEndpoints(
	endpoints: Array<Identity.AclEndpoint> | undefined,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	if (!endpoints) return false;

	return endpoints.some((e: Identity.AclEndpoint): boolean =>
		operationAllowedEndpoint(e, endpoint, operations)
	);
}

// operationAllowedOrganization matches if the endpoint and operations are
// allowed at the organization scope or some project scopes.
function operationAllowedOrganization(
	organizationACL: Identity.AclOrganization,
	organizationID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	if (organizationACL.id != organizationID) return false;

	return (
		operationAllowedEndpoints(organizationACL.endpoints, endpoint, operations) ||
		organizationACL.projects?.some((p: Identity.AclProject) => {
			return operationAllowedEndpoints(p.endpoints, endpoint, operations);
		}) ||
		false
	);
}

function operationAllowedOrganizationScoped(
	organizationsACL: Array<Identity.AclOrganization> | undefined,
	organizationID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	if (!organizationsACL) return false;

	return organizationsACL.some((o: Identity.AclOrganization) => {
		return operationAllowedOrganization(o, organizationID, endpoint, operations);
	});
}

// This is used to see if the ACL is permitted to perform
// an operation on a specific organization scoped endpoint.
function organizationOperationAllowed(
	acl: Identity.Acl,
	organizationID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	return (
		operationAllowedEndpoints(acl.global, endpoint, operations) ||
		operationAllowedOrganizationScoped(acl.organizations, organizationID, endpoint, operations)
	);
}

export function organizationScopesAllowed(
	acl: Identity.Acl,
	organizationID: string,
	scopes: Array<OrganizationScope>
): boolean {
	return scopes.every((scope) =>
		organizationOperationAllowed(acl, organizationID, scope.endpoint, scope.operations)
	);
}
