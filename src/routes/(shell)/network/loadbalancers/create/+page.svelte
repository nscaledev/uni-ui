<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import ShellMetadataItem from '$lib/layouts/ShellMetadataItem.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import Button from '$lib/forms/Button.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import LoadBalancerListenerV2 from '$lib/layouts/LoadBalancerListenerV2.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Create Load Balancer',
		description: 'Create and deploy a new load balancer.',
		icon: 'mdi:router-network-wireless'
	};

	function defaultListener(index: number): Region.LoadBalancerListenerV2 {
		return {
			name: `listener-${index}`,
			protocol: Region.LoadBalancerListenerProtocolV2.Tcp,
			port: 80,
			allowedCidrs: [],
			idleTimeoutSeconds: undefined,
			pool: {
				proxyProtocolV2: false,
				members: [],
				healthCheck: undefined
			}
		};
	}

	function initialNetworkID(): string {
		return data.network.metadata.id;
	}

	let resource: Region.LoadBalancerV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({
				dictionaries: [adjectives, animals],
				separator: '-',
				length: 2
			}),
			description: '',
			tags: []
		},
		spec: {
			networkId: initialNetworkID(),
			publicIP: false,
			listeners: [defaultListener(1)]
		}
	});

	let metadataValid = $state(false);
	let listenerActive = $state(false);
	let listenerValid = $state(true);

	let names = $derived(data.loadBalancers.map((x) => x.metadata.name));

	let valid = $derived(
		metadataValid && !listenerActive && listenerValid && resource.spec.listeners.length > 0
	);

	function lookupProjectName(): string {
		return (
			data.projects.find((x) => x.metadata.id == data.network.metadata.projectId)?.metadata.name ||
			''
		);
	}

	function addListener(): number {
		resource.spec.listeners.push(defaultListener(resource.spec.listeners.length + 1));

		return resource.spec.listeners.length - 1;
	}

	function removeListener(index: number) {
		resource.spec.listeners.splice(index, 1);
	}

	function submit() {
		const request: Region.LoadBalancerV2Create = {
			metadata: {
				name: resource.metadata.name,
				description: resource.metadata.description,
				tags: resource.metadata.tags || []
			},
			spec: {
				networkId: resource.spec.networkId,
				publicIP: resource.spec.publicIP ?? false,
				listeners: resource.spec.listeners
			}
		};

		if (resource.spec.vipAddress) {
			request.spec.vipAddress = resource.spec.vipAddress;
		}

		const parameters: Region.ApiV2LoadbalancersPostRequest = {
			loadBalancerV2Create: request
		};

		Clients.region()
			.apiV2LoadbalancersPost(parameters)
			.then((response) =>
				window.location.assign(
					response.metadata.id
						? `/network/loadbalancers/view/${response.metadata.id}`
						: '/network/loadbalancers'
				)
			)
			.catch((e: Error) => Clients.error(e));
	}

	function printListenerProtocol(listener: Region.LoadBalancerListenerV2): string {
		return listener.protocol.toUpperCase();
	}
</script>

<ShellPageHeader {settings} />

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Context">
	<div class="grid grid-cols-[repeat(3,max-content)] gap-2 text-sm">
		<ShellMetadataItem icon="mdi:folder-open-outline" label="Project" value={lookupProjectName()} />
		<ShellMetadataItem
			icon={RegionUtil.flag(data.regions, data.network.status.regionId)}
			label="Region"
			value={RegionUtil.name(data.regions, data.network.status.regionId)}
		/>
		<ShellMetadataItem
			icon="mdi:network-outline"
			label="Network"
			value={data.network.metadata.name}
		/>
	</div>
</ShellSection>

<ShellSection title="Configuration">
	<div class="flex flex-col gap-6">
		<Switch
			name="load-balancer-public-ip"
			initial={resource.spec.publicIP ?? false}
			label="Allocate a public IP."
			onCheckedChange={(event) => (resource.spec.publicIP = event.checked)}
		/>

		<TextInput
			bind:value={resource.spec.vipAddress}
			label="Requested VIP address."
			hint="Leave this empty to let the backend choose an address."
		/>
	</div>
</ShellSection>

<ResourceList
	title="Listeners"
	titleClass="h3"
	columns={4}
	items={resource.spec.listeners}
	bind:active={listenerActive}
	valid={listenerValid}
	add={addListener}
	remove={removeListener}
>
	{#snippet normal(listener: Region.LoadBalancerListenerV2, index: number)}
		<div class="flex gap-2 items-center">
			<iconify-icon icon="mdi:label-outline" class="text-2xl"></iconify-icon>
			{listener.name || `Listener ${index + 1}`}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="mdi:transit-connection-variant" class="text-2xl"></iconify-icon>
			{printListenerProtocol(listener)}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="fluent:usb-port-24-regular" class="text-2xl"></iconify-icon>
			{listener.port}
		</div>
		<div class="flex gap-2 items-center">
			<iconify-icon icon="mdi:server-network-outline" class="text-2xl"></iconify-icon>
			{listener.pool.members.length} members
		</div>
	{/snippet}

	<!-- eslint-disable @typescript-eslint/no-unused-vars -->
	{#snippet expanded(listener: Region.LoadBalancerListenerV2, index: number)}
		<LoadBalancerListenerV2
			bind:listener={resource.spec.listeners[index]}
			bind:valid={listenerValid}
		/>
	{/snippet}
</ResourceList>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/network/loadbalancers"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
