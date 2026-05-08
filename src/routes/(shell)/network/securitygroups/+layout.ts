export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:securitygroups');

	const { organizationID, projectID } = await parent();

	const [networks, securityGroups] = await Promise.all([
		Clients.region(fetch).apiV2NetworksGet({
			organizationID: [organizationID],
			projectID: projectID ? [projectID] : undefined
		}),
		Clients.region(fetch).apiV2SecuritygroupsGet({
			organizationID: [organizationID],
			projectID: projectID ? [projectID] : undefined
		})
	]);

	return { networks, securityGroups };
};
