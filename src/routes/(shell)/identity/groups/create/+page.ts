export const ssr = false;

import type { PageLoad } from './$types';

import * as Clients from '#lib/clients/index.ts';

export const load: PageLoad = async ({ fetch, parent }) => {
	const { organizationID } = await parent();

	const roles = Clients.identity(fetch).apiV1OrganizationsOrganizationIDRolesGet({
		organizationID: organizationID
	});

	const users = Clients.identity(fetch).apiV1OrganizationsOrganizationIDUsersGet({
		organizationID: organizationID
	});

	const serviceAccounts = Clients.identity(
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
