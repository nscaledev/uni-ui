export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import * as Clients from '$lib/clients';

export const load: PageLoad = async ({ fetch, parent, params, url }) => {
	const { organizationID, serviceAccounts } = await parent();

	const serviceAccount = serviceAccounts.find((x) => x.metadata.id == params['id']);
	if (!serviceAccount) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

	const groups = Clients.identity(fetch).apiV1OrganizationsOrganizationIDGroupsGet({
		organizationID: organizationID
	});

	return {
		serviceAccount: serviceAccount,
		groups: await groups
	};
};
