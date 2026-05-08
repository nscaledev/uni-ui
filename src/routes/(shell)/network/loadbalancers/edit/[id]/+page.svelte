<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';

	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import ResourceList from '$lib/layouts/ResourceList.svelte';
	import Switch from '$lib/forms/Switch.svelte';
	import LoadBalancerListenerV2 from '$lib/layouts/LoadBalancerListenerV2.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

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

	const networkName = $derived(
		data.networks.find((n) => n.metadata.id === data.loadBalancer.status.networkId)?.metadata
			.name || data.loadBalancer.status.networkId
	);
	const regionName = $derived(RegionUtil.name(data.regions, data.loadBalancer.status.regionId));

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
		Clients.region()
			.apiV2LoadbalancersLoadBalancerIDPut({
				loadBalancerID: data.loadBalancer.metadata.id,
				loadBalancerV2Update: resource
			})
			.then(() =>
				window.location.assign(`/network/loadbalancers/view/${data.loadBalancer.metadata.id}`)
			)
			.catch((e: Error) => Clients.error(e));
	}

	function printListenerProtocol(listener: Region.LoadBalancerListenerV2): string {
		return listener.protocol.toUpperCase();
	}
</script>

<FormPage
	breadcrumb={[
		{ label: 'Load Balancers', href: '/network/loadbalancers' },
		{ label: data.loadBalancer.metadata.name }
	]}
	cancelHref="/network/loadbalancers/view/{data.loadBalancer.metadata.id}"
	submitLabel="Save Changes"
	description="Update load balancer configuration and listeners."
	onSubmit={submit}
	{valid}
>
	{#snippet summary()}
		<dl class="summary">
			<dt>Network</dt>
			<dd>{networkName}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, data.loadBalancer.status.regionId)} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Listeners</dt>
			<dd>{resource.spec.listeners.length}</dd>
		</dl>
	{/snippet}

	{#snippet form()}
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
			<p class="listener-note">
				Protocol or port changes on existing listeners may be rejected by the backend. If that
				happens, remove and recreate the listener with the desired settings.
			</p>
		</ShellSection>

		<ResourceList
			title="Listeners"
			columns={4}
			items={resource.spec.listeners}
			bind:active={listenerActive}
			valid={listenerValid}
			add={addListener}
			remove={removeListener}
		>
			{#snippet normal(listener: Region.LoadBalancerListenerV2, index: number)}
				<div class="icon-cell">
					<Icon name="tag" size={14} />{listener.name || `Listener ${index + 1}`}
				</div>
				<div class="icon-cell">
					<Icon name="link" size={14} />{printListenerProtocol(listener)}
				</div>
				<div class="icon-cell"><Icon name="usb" size={14} />{listener.port}</div>
				<div class="icon-cell">
					<Icon name="network" size={14} />{listener.pool.members.length} members
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
	{/snippet}
</FormPage>

<style>
	.listener-note {
		font-size: 13px;
		color: var(--text-3);
	}
</style>
