export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:networks');

	const { organizationID } = await parent();

	const networks = Clients.region(fetch).apiV2OrganizationsOrganizationIDNetworksGet({
		organizationID: organizationID
	});

	return {
		networks: await networks
	};
};
