<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as RegionUtil from '$lib/regionutil';

	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import InputChips from '$lib/forms/InputChips.svelte';

	// eslint-disable-next-line svelte/valid-compile
	const organizationID = data.organizationID;
	// eslint-disable-next-line svelte/valid-compile
	const projectID = data.projectID;
	// eslint-disable-next-line svelte/valid-compile
	const regionID = data.regionID;

	let resource: Region.NetworkV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-', length: 2 })
		},
		spec: {
			organizationId: organizationID,
			projectId: projectID,
			regionId: regionID,
			prefix: '192.168.0.0/24',
			dnsNameservers: []
		}
	});

	let metadataValid = $state(false);
	let valid = $derived(metadataValid);

	function submit() {
		Clients.region()
			.apiV2NetworksPost({ networkV2Create: resource })
			.then(() => window.location.assign('/network/networks'))
			.catch((e: Error) => Clients.error(e));
	}

	const projectName = $derived(
		data.projects?.find((p) => p.metadata.id === projectID)?.metadata.name ?? projectID
	);
	const regionName = $derived(RegionUtil.name(data.regions, regionID));
</script>

<FormPage
	breadcrumb={[{ label: 'Networks', href: '/network/networks' }, { label: 'Create' }]}
	cancelHref="/network/networks"
	submitLabel="Create Network"
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} names={[]} bind:valid={metadataValid} />

		<ShellSection title="Configuration">
			<TextInput
				label="Network prefix"
				hint="Must be at least a /24. The top /25 is reserved for storage integration."
				bind:value={resource.spec.prefix}
			/>
			<InputChips
				label="DNS nameservers"
				hint="Explicit nameservers prevent instances on the same network from resolving each other."
				name="dns-nameservers"
				bind:value={resource.spec.dnsNameservers}
			/>
		</ShellSection>
	{/snippet}

	{#snippet summary()}
		<dl class="summary">
			<dt>Project</dt>
			<dd>{projectName}</dd>
			<dt>Region</dt>
			<dd>{RegionUtil.flag(data.regions, regionID)} {regionName}</dd>
			<dt>Name</dt>
			<dd>{resource.metadata.name || '—'}</dd>
			<dt>Prefix</dt>
			<dd>{resource.spec.prefix}</dd>
			{#if resource.spec.dnsNameservers?.length}
				<dt>DNS</dt>
				<dd>{resource.spec.dnsNameservers.join(', ')}</dd>
			{/if}
		</dl>
	{/snippet}
</FormPage>
