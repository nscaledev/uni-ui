export const ssr = false;

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, params }) => {
	const { securityGroups } = await parent();

	const securityGroup = securityGroups.find((x) => x.metadata.id == params['id']);
	if (!securityGroup) {
		error(404, 'security group not found');
	}

	return {
		securityGroup: securityGroup
	};
};
