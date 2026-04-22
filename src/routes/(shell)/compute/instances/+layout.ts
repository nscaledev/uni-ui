export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:instances');

	const { organizationID } = await parent();

	const networks = Clients.region(fetch).apiV2NetworksGet({
		organizationID: [organizationID]
	});

	const instances = Clients.compute(fetch).apiV2InstancesGet({
		organizationID: [organizationID]
	});

	return {
		networks: await networks,
		instances: await instances
	};
};
