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

function operationAllowedOrganization(
	organizationACL: Identity.AclOrganization,
	organizationID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	if (organizationACL.id != organizationID) return false;

	return operationAllowedEndpoints(organizationACL.endpoints, endpoint, operations);
}

function operationAllowedProject(
	projectACL: Identity.AclProject,
	projectID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	if (projectACL.id != projectID) return false;

	return operationAllowedEndpoints(projectACL.endpoints, endpoint, operations);
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

function operationAllowedProjectScoped(
	organizationsACL: Array<Identity.AclOrganization> | undefined,
	organizationID: string,
	projectID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	if (!organizationsACL) return false;

	return organizationsACL.some((o: Identity.AclOrganization) => {
		return (
			operationAllowedOrganization(o, organizationID, endpoint, operations) ||
			o.projects?.some((p: Identity.AclProject) => {
				return operationAllowedOrganization(p, projectID, endpoint, operations);
			})
		);
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

// This is used to see if the ACL is permitted to perform
// an operation on a specific project scoped endpoint.
function projectOperationAllowed(
	acl: Identity.Acl,
	organizationID: string,
	projectID: string,
	endpoint: string,
	operations: Array<Identity.AclOperation>
): boolean {
	return (
		operationAllowedEndpoints(acl.global, endpoint, operations) ||
		operationAllowedProjectScoped(
			acl.organizations,
			organizationID,
			projectID,
			endpoint,
			operations
		)
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

export function projectScopesAllowed(
	acl: Identity.Acl,
	organizationID: string,
	scopes: Array<ProjectScope>
): boolean {
	return scopes.every((scope) =>
		projectOperationAllowed(acl, organizationID, scope.projectID, scope.endpoint, scope.operations)
	);
}
