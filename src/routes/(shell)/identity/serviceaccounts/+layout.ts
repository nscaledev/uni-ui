export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:serviceaccounts');

	const { organizationID } = await parent();

	const [serviceAccounts, groups] = await Promise.all([
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDServiceaccountsGet({ organizationID }),
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDGroupsGet({ organizationID })
	]);

	return { serviceAccounts, groups };
};
