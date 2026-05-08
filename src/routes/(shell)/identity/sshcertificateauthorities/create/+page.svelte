<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Clients from '$lib/clients';
	import * as Region from '$lib/openapi/region';
	import * as Validation from '$lib/validation';
	import FormPage from '$lib/layouts/FormPage.svelte';
	import ShellMetadataSection from '$lib/layouts/ShellMetadataSection.svelte';
	import ShellSection from '$lib/layouts/ShellSection.svelte';
	import Select from '$lib/forms/Select.svelte';
	import TextInput from '$lib/forms/TextInput.svelte';
	let names = $derived(data.sshCertificateAuthorities.map((x) => x.metadata.name));
	// eslint-disable-next-line svelte/valid-compile
	const initialProjectID = data.projects[0]?.metadata.id || '';
	let resource: {
		metadata: Region.ResourceWriteMetadata;
		spec: { publicKey: string; projectId: string };
	} = $state({
		metadata: { name: '' },
		spec: { publicKey: '', projectId: initialProjectID }
	});
	let metadataValid = $state(false);
	let publicKeyValid = $state(false);
	let valid = $derived(metadataValid && publicKeyValid && !!resource.spec.projectId);
	function submit() {
		const body: Region.SshCertificateAuthorityV2Create = {
			metadata: resource.metadata,
			spec: {
				publicKey: resource.spec.publicKey,
				organizationId: data.organizationID,
				projectId: resource.spec.projectId
			}
		};
		Clients.region()
			.apiV2SshcertificateauthoritiesPost({ sshCertificateAuthorityV2Create: body })
			.then(() => window.location.assign('/identity/sshcertificateauthorities'))
			.catch((e: Error) => Clients.error(e));
	}
</script>

<FormPage
	breadcrumb={[
		{ label: 'SSH Certificate Authorities', href: '/identity/sshcertificateauthorities' },
		{ label: 'Create' }
	]}
	cancelHref="/identity/sshcertificateauthorities"
	submitLabel="Create CA"
	description="Generate an SSH certificate authority for user certificate-based instance access."
	onSubmit={submit}
	{valid}
>
	{#snippet form()}
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
				label="Public key"
				hint="Provide a single-line OpenSSH-formatted CA public key."
				placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA..."
				validators={[Validation.stringSet]}
				bind:value={resource.spec.publicKey}
				bind:valid={publicKeyValid}
			/>
		</ShellSection>
	{/snippet}
</FormPage>
