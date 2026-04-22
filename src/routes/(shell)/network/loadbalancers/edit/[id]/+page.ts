export const ssr = false;

import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import type * as Region from '$lib/openapi/region';

function cloneListeners(
	listeners: Array<Region.LoadBalancerListenerV2>
): Array<Region.LoadBalancerListenerV2> {
	return listeners.map((listener) => ({
		name: listener.name,
		protocol: listener.protocol,
		port: listener.port,
		allowedCidrs: listener.allowedCidrs ? [...listener.allowedCidrs] : [],
		idleTimeoutSeconds: listener.idleTimeoutSeconds,
		pool: {
			proxyProtocolV2: listener.pool.proxyProtocolV2 ?? false,
			members: listener.pool.members.map((member) => ({
				address: member.address,
				port: member.port
			})),
			healthCheck: listener.pool.healthCheck
				? {
						intervalSeconds: listener.pool.healthCheck.intervalSeconds,
						timeoutSeconds: listener.pool.healthCheck.timeoutSeconds,
						healthyThreshold: listener.pool.healthCheck.healthyThreshold,
						unhealthyThreshold: listener.pool.healthCheck.unhealthyThreshold
					}
				: undefined
		}
	}));
}

export const load: PageLoad = async ({ parent, params, url }) => {
	const { loadBalancers } = await parent();

	const loadBalancer = loadBalancers.find((x) => x.metadata.id == params['id']);
	if (!loadBalancer) {
		redirect(307, url.pathname.split('/').slice(0, -2).join('/'));
	}

	return {
		loadBalancer,
		draft: {
			metadata: {
				name: loadBalancer.metadata.name,
				description: loadBalancer.metadata.description || '',
				tags: loadBalancer.metadata.tags || []
			},
			spec: {
				publicIP: loadBalancer.spec.publicIP ?? false,
				listeners: cloneListeners(loadBalancer.spec.listeners)
			}
		}
	};
};
