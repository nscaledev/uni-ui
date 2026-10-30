export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '#lib/clients/index.ts';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:groups');

	const { organizationID } = await parent();

	const groups = Clients.identity(fetch).apiV1OrganizationsOrganizationIDGroupsGet({
		organizationID: organizationID
	});

	return {
		groups: await groups
	};
};
