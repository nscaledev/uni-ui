export const ssr = false;

import type { LayoutLoad } from './$types';

import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:loadbalancers');

	const parentData = await parent();
	const { organizationID } = parentData;

	const [networks, loadBalancers] = await Promise.all([
		Clients.region(fetch).apiV2NetworksGet({
			organizationID: [organizationID]
		}),
		Clients.region(fetch).apiV2LoadbalancersGet({
			organizationID: [organizationID]
		})
	]);

	return {
		...parentData,
		networks,
		loadBalancers
	};
};
