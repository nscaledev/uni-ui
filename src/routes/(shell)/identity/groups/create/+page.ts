export const ssr = false;

import type { PageLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { token, organizationID } = await parent();

	const roles = Clients.identity(token, fetch).apiV1OrganizationsOrganizationIDRolesGet({
		organizationID: organizationID
	});

	const users = Clients.identity(token, fetch).apiV1OrganizationsOrganizationIDUsersGet({
		organizationID: organizationID
	});

	const serviceAccounts = Clients.identity(
		token,
		fetch
	).apiV1OrganizationsOrganizationIDServiceaccountsGet({
		organizationID: organizationID
	});

	return {
		roles: await roles,
		users: await users,
		serviceAccounts: await serviceAccounts
	};
};
