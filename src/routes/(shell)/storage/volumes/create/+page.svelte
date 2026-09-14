<script lang="ts">
	import type { PageData } from './$types';
	import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import NumberInput from '$lib/forms/NumberInput.svelte';
	import Select from '$lib/forms/Select.svelte';

	let { data }: { data: PageData } = $props();
	let metadataValid = $state(false);
	let networkID = $state(data.networks[0]?.metadata.id ?? '');
	const network = $derived(data.networks.find((item) => item.metadata.id === networkID));
	const volumeClasses = $derived(
		data.volumeClasses.filter((item) => item.spec.regionId === network?.status.regionId)
	);
	let volumeClassID = $state('');
	const volumeClass = $derived(volumeClasses.find((item) => item.metadata.id === volumeClassID));
	let resource: Region.VolumeV2Create = $state({
		metadata: {
			name: uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: '-', length: 2 })
		},
		spec: { networkId: networkID, volumeClassId: volumeClassID, sizeGiB: 10 }
	});
	const valid = $derived(
		metadataValid &&
			!!resource.spec.networkId &&
			!!resource.spec.volumeClassId &&
			!!volumeClass &&
			Number.isInteger(resource.spec.sizeGiB) &&
			resource.spec.sizeGiB >= (volumeClass.spec.minimumSizeGiB ?? 1) &&
			(volumeClass.spec.maximumSizeGiB === undefined ||
				resource.spec.sizeGiB <= volumeClass.spec.maximumSizeGiB)
	);

	$effect(() => {
		resource.spec.networkId = networkID;
		if (!volumeClasses.some((item) => item.metadata.id === volumeClassID))
			volumeClassID = volumeClasses[0]?.metadata.id ?? '';
		resource.spec.volumeClassId = volumeClassID;
	});

	function submit() {
		Clients.region()
			.apiV2VolumesPost({ volumeV2Create: resource })
			.then(() => window.location.assign('/storage/volumes'))
			.catch((error: Error) => Clients.error(error));
	}
</script>

<FormPage
	breadcrumb={[{ label: 'Volumes', href: '/storage/volumes' }, { label: 'Create' }]}
	cancelHref="/storage/volumes"
	submitLabel="Create Volume"
	description="Provision block storage on a private network."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
		<ShellMetadataSection metadata={resource.metadata} names={[]} bind:valid={metadataValid} />
		<ShellSection title="Configuration">
			<Select label="Network" bind:value={networkID}>
				{#each data.networks as item (item.metadata.id)}
					<option value={item.metadata.id}>{item.metadata.name}</option>
				{/each}
			</Select>
			<Select label="Volume class" bind:value={volumeClassID}>
				{#each volumeClasses as item (item.metadata.id)}
					<option value={item.metadata.id}>{item.metadata.name}</option>
				{/each}
			</Select>
			<NumberInput
				label="Size (GiB)"
				hint="The requested volume capacity in gibibytes."
				min={volumeClass?.spec.minimumSizeGiB ?? 1}
				max={volumeClass?.spec.maximumSizeGiB}
				bind:value={resource.spec.sizeGiB}
			/>
		</ShellSection>
	{/snippet}
	{#snippet summary()}<dl class="summary">
			<dt>Network</dt>
			<dd>{network?.metadata.name ?? '—'}</dd>
			<dt>Size</dt>
			<dd>{resource.spec.sizeGiB} GiB</dd>
		</dl>{/snippet}
</FormPage>
