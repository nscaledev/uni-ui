export const ssr = false;

import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, params }) => {
	const { networks } = await parent();

	const network = networks.find((x) => x.metadata.id == params['id']);
	if (!network) {
		error(404, 'network not found');
	}

	return {
		network: network
	};
};
