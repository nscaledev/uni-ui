export const ssr = false;

import type { LayoutLoad } from './$types';
import * as Clients from '$lib/clients';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
	depends('layout:sshcertificateauthorities');

	const { organizationID, projectID } = await parent();

	const [projects, sshCertificateAuthorities] = await Promise.all([
		Clients.identity(fetch).apiV1OrganizationsOrganizationIDProjectsGet({ organizationID }),
		Clients.region(fetch).apiV2SshcertificateauthoritiesGet({
			organizationID: [organizationID],
			projectID: projectID ? [projectID] : undefined
		})
	]);

	return { projects, sshCertificateAuthorities };
};
