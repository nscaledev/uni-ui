<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';

	import type { ShellPageSettings } from '$lib/layouts/types.ts';
	import ShellPageHeader from '$lib/layouts/ShellPageHeader.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Select from '$lib/forms/Select.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	import Button from '$lib/forms/Button.svelte';
	import * as Validation from '$lib/validation';

	const settings: ShellPageSettings = {
		feature: 'Identity',
		name: 'Create SSH Certificate CA',
		description: 'Create a new SSH certificate authority for a project.',
		icon: 'mdi:key-chain-variant'
	};

	let names = $derived(data.sshCertificateAuthorities.map((x) => x.metadata.name));

	function initialProjectID(): string {
		return data.projects[0]?.metadata.id || '';
	}

	let resource: {
		metadata: Region.ResourceWriteMetadata;
		spec: {
			publicKey: string;
			projectId: string;
		};
	} = $state({
		metadata: {
			name: ''
		},
		spec: {
			publicKey: '',
			projectId: initialProjectID()
		}
	});

	let metadataValid = $state(false);
	let publicKeyValid = $state(false);

	let valid = $derived(metadataValid && publicKeyValid && !!resource.spec.projectId);

	function submit() {
		const sshCertificateAuthorityV2Create: Region.SshCertificateAuthorityV2Create = {
			metadata: resource.metadata,
			spec: {
				publicKey: resource.spec.publicKey,
				organizationId: data.organizationID,
				projectId: resource.spec.projectId
			}
		};

		Clients.region()
			.apiV2SshcertificateauthoritiesPost({
				sshCertificateAuthorityV2Create: sshCertificateAuthorityV2Create
			})
			.then(() => window.location.assign('/identity/sshcertificateauthorities'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<ShellPageHeader {settings} />

<ShellMetadataSection metadata={resource.metadata} {names} bind:valid={metadataValid} />

<ShellSection title="Configuration">
	<Select
		label="Project"
		hint="Choose the project that should be allowed to use this SSH certificate authority."
		bind:value={resource.spec.projectId}
		disabled={data.projects.length == 0}
	>
		{#each data.projects as project}
			<option value={project.metadata.id}>{project.metadata.name}</option>
		{/each}
	</Select>

	<TextInput
		label="Public Key"
		hint="Provide a single-line OpenSSH-formatted CA public key."
		placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA..."
		validators={[Validation.stringSet]}
		bind:value={resource.spec.publicKey}
		bind:valid={publicKeyValid}
	/>
</ShellSection>

<div class="flex justify-between">
	<Button
		icon="mdi:cancel-bold"
		label="Cancel"
		class="preset-outlined-surface-600-400"
		href="/identity/sshcertificateauthorities"
	/>
	<Button
		icon="mdi:tick"
		label="Create"
		class="preset-filled-primary-500"
		clicked={submit}
		disabled={!valid}
	/>
</div>
