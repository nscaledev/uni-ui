<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import Button from '$lib/forms/Button.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import LoadBalancerListenerV2 from '$lib/layouts/LoadBalancerListenerV2.svelte';

	const settings: ShellPageSettings = {
		feature: 'Network',
		name: 'Update Load Balancer',
		description: 'Update an existing load balancer.',
		icon: 'mdi:router-network-wireless'
	};

	function initialDraft(): Region.LoadBalancerV2Update {
		return data.draft;
	}

	let resource: Region.LoadBalancerV2Update = $state(initialDraft());

	let metadataValid = $state(false);
	let listenerActive = $state(false);
	let listenerValid = $state(true);

	let names = $derived(
		data.loadBalancers
			.filter((x) => x.metadata.id != data.loadBalancer.metadata.id)
			.map((x) => x.metadata.name)
	);

	let valid = $derived(
		metadataValid && !listenerActive && listenerValid && resource.spec.listeners.length > 0
	);

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

	function addListener(): number {
		resource.spec.listeners.push(defaultListener(resource.spec.listeners.length + 1));

		return resource.spec.listeners.length - 1;
	}

	function removeListener(index: number) {
		resource.spec.listeners.splice(index, 1);
	}

	function submit() {
		const parameters: Region.ApiV2LoadbalancersLoadBalancerIDPutRequest = {
			loadBalancerID: data.loadBalancer.metadata.id,
			loadBalancerV2Update: resource
		};

		Clients.region()
			.apiV2LoadbalancersLoadBalancerIDPut(parameters)
			.then(() =>
				window.location.assign(`/network/loadbalancers/view/${data.loadBalancer.metadata.id}`)
			)
			.catch((e: Error) => Clients.error(e));
	}

	function printListenerProtocol(listener: Region.LoadBalancerListenerV2): string {
		return listener.protocol.toUpperCase();
	}
</script>

<ShellPageHeader {settings} />

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Configuration">
	<Switch
		name="edit-load-balancer-public-ip"
		initial={resource.spec.publicIP ?? false}
		label="Allocate a public IP."
		onCheckedChange={(event) => (resource.spec.publicIP = event.checked)}
	/>
</ShellSection>

<ShellSection title="Listeners">
	<p class="text-sm text-surface-700-300">
		Protocol or port changes on existing listeners may be rejected by the backend. If that happens,
		remove and recreate the listener with the desired settings.
	</p>
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
		href="/network/loadbalancers/view/{data.loadBalancer.metadata.id}"
	/>
	<Button
		icon="mdi:tick"
		label="Update"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
