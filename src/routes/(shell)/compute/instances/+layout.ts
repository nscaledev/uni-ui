export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:instances');

	const { organizationID, projectID } = await parent();

	const [networks, instances, sshCertificateAuthorities] = await Promise.all([
		Clients.region(fetch).apiV2NetworksGet({
			organizationID: [organizationID],
			projectID: projectID ? [projectID] : undefined
		}),
		Clients.compute(fetch).apiV2InstancesGet({
			organizationID: [organizationID],
			projectID: projectID ? [projectID] : undefined
		}),
		Clients.region(fetch).apiV2SshcertificateauthoritiesGet({
			organizationID: [organizationID],
			projectID: projectID ? [projectID] : undefined
		})
	]);

	return { networks, instances, sshCertificateAuthorities };
};
