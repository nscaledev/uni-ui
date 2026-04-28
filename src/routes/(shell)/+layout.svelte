<script lang="ts">
	import type { LayoutData } from './$types';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	/* Required for OpenTelemetry */
	import { Resource } from '@opentelemetry/resources';
	import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
	import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';

	const provider = new BasicTracerProvider({
		resource: new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: 'unikorn-ui'
		})
	});
	provider.register();

	import Toast from '$lib/primitives/Toast.svelte';
	import Spinner from '$lib/primitives/Spinner.svelte';
	import Brand from '$lib/shell/Brand.svelte';
	import SideBar from '$lib/shell/SideBar.svelte';
	import Header from '$lib/shell/Header.svelte';
	import Tweaks from '$lib/shell/Tweaks.svelte';

	let loading = $state(false);
	beforeNavigate(() => (loading = true));
	afterNavigate(() => (loading = false));
</script>

{#if loading}
	<div class="loading-overlay" in:fade={{ duration: 1000 }} out:fade={{ duration: 200 }}>
		<Spinner />
	</div>
{/if}

<Toast />

<div class="shell">
	<Brand />

	<Header
		profile={data.profile}
		organizations={data.organizations}
		organizationID={data.organizationID}
	/>

	<SideBar organizations={data.organizations} organizationID={data.organizationID} acl={data.acl} />

	<main class="main">
		{@render children?.()}
	</main>
</div>

<Tweaks />

<style>
	.shell {
		display: grid;
		grid-template-columns: 240px 1fr;
		grid-template-rows: 52px 1fr;
		grid-template-areas: 'brand header' 'sidebar main';
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: var(--bg-0);
	}

	.loading-overlay {
		position: fixed;
		inset: 0;
		z-index: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(4px);
		background: rgba(0, 0, 0, 0.2);
	}
</style>
