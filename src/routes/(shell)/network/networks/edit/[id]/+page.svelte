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
	import TextInput from '$lib/forms/TextInput.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';
	import Icon from '$lib/primitives/Icon.svelte';

	const projectName = $derived(
		data.projects.find((p) => p.metadata.id === data.network.metadata.projectId)?.metadata.name ??
			data.network.metadata.projectId
	);
	const regionName = $derived(RegionUtil.name(data.regions, data.network.status.regionId));

	let resource = $derived.by(() => {
		let n = $state(data.network);
		return n;
	});

	let routes: Array<Region.Route> = $derived.by(() => {
		let r = $state(data.network.spec.routes ?? []);
		return r;
	});

	let metadataValid = $state(false);
	let routeActive = $state(false);
	let valid = $derived(metadataValid && !routeActive);

	function routeAdd(): number {
		routes.push({ prefix: '', nexthop: '' });
		return routes.length - 1;
	}

	function routeRemove(index: number) {
		routes.splice(index, 1);
	}

	function submit() {
		const update: Region.NetworkV2Update = {
			metadata: { name: resource.metadata.name },
			spec: {
				dnsNameservers: resource.spec.dnsNameservers,
				routes: routes.length > 0 ? routes : undefined
			}
		};
		Clients.region()
			.apiV2NetworksNetworkIDPut({ networkID: resource.metadata.id, networkV2Update: update })
			.then(() => window.location.assign('/network/networks'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Networks', href: '/network/networks' }, { label: resource.metadata.name }]}
	cancelHref="/network/networks"
	submitLabel="Save Changes"
	description="Modify network DNS and host routes."
	onSubmit={submit}
	{valid}
>
	{#snippet summary()}
		<dl class="summary">
			<dt>Project</dt>
			<dd>{projectName}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, data.network.status.regionId)} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Prefix</dt>
			<dd>{data.network.status.prefix}</dd>
		</dl>
	{/snippet}

	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} names={[]} bind:valid={metadataValid} />

		<ShellSection title="Configuration">
			<InputChips
				label="DNS nameservers"
				hint="Explicit nameservers prevent instances on the same network from resolving each other."
				name="dns-nameservers"
				bind:value={resource.spec.dnsNameservers}
			/>
		</ShellSection>

		<ResourceList
			title="Host Routes"
			columns={2}
			items={routes}
			bind:active={routeActive}
			add={routeAdd}
			remove={routeRemove}
		>
			{#snippet normal(route: Region.Route)}
				<div class="route-cell"><Icon name="network" size={16} />{route.prefix || '—'}</div>
				<div class="route-cell"><Icon name="arrowRight" size={16} />{route.nexthop || '—'}</div>
			{/snippet}
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#snippet expanded(_route: Region.Route, index: number)}
				<TextInput
					label="Prefix"
					hint="Destination CIDR, e.g. 10.0.0.0/8"
					bind:value={routes[index].prefix}
				/>
				<TextInput
					label="Next hop"
					hint="Gateway IPv4 address"
					bind:value={routes[index].nexthop}
				/>
			{/snippet}
		</ResourceList>
	{/snippet}
</FormPage>

<style>
	.route-cell {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
	}
</style>
