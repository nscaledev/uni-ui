export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:securitygroups');

	const { organizationID } = await parent();

	const networks = Clients.region(fetch).apiV2NetworksGet({
		organizationID: [organizationID]
	});

	const securitygGroups = Clients.region(fetch).apiV2SecuritygroupsGet({
		organizationID: [organizationID]
	});

	return {
		networks: await networks,
		securityGroups: await securitygGroups
	};
};
