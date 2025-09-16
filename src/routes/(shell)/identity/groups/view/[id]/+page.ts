export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import * as Clients from '$lib/clients';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
	const { organizationID, groups } = await parent();

	const group = groups.find((x) => x.metadata.id == params['id']);
	if (!group) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

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
		group: group,
		roles: await roles,
		users: await users,
		serviceAccounts: await serviceAccounts
	};
};
