export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';
import * as Kubernetes from '$lib/openapi/kubernetes';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:clusters');

	const { organizationID, projectID } = await parent();

	const [allClusters, regions] = await Promise.all([
		Clients.kubernetes(fetch).apiV1OrganizationsOrganizationIDClustersGet({ organizationID }),
		Clients.kubernetes(fetch).apiV1OrganizationsOrganizationIDRegionsGet({
			organizationID,
			regionType: Kubernetes.RegionTypeParameter.Physical
		})
	]);

	const clusters = projectID
		? allClusters.filter((c) => c.metadata.projectId === projectID)
		: allClusters;

	return { clusters, regions };
};
