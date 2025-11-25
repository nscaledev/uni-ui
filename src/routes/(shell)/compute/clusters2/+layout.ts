export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:clusters2');

	const { organizationID } = await parent();

	const networks = Clients.region(fetch).apiV2NetworksGet({
		organizationID: [organizationID]
	});

	const clusters = Clients.compute(fetch).apiV2ClustersGet({
		organizationID: [organizationID]
	});

	return {
		networks: await networks,
		clusters: await clusters
	};
};
