export const ssr = false;

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
	const { organizationID, organizations } = await parent();

	const organization = organizations.find((x) => x.metadata.id == organizationID);
	if (!organization) {
		error(404, 'organization not found');
	}

	return {
		organization: organization
	};
};
